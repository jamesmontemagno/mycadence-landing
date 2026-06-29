const CSC_SERVICE_UUID = 0x1816;
const CSC_MEASUREMENT_UUID = 0x2a5b;
const STORAGE_KEYS = {
    theme: "mycadence:web-theme",
    savedDeviceId: "mycadence:web-device-id",
    savedDeviceName: "mycadence:web-device-name",
    autoReconnect: "mycadence:web-auto-reconnect"
};
const STALE_TIMEOUT_MS = 4500;

const statusElement = document.getElementById("status");
const cadenceValueElement = document.getElementById("cadence-value");
const savedSensorElement = document.getElementById("saved-sensor");
const connectButton = document.getElementById("connect-btn");
const reconnectButton = document.getElementById("reconnect-btn");
const disconnectButton = document.getElementById("disconnect-btn");
const autoReconnectCheckbox = document.getElementById("auto-reconnect");
const themeSelect = document.getElementById("theme-select");

let device = null;
let cscMeasurementCharacteristic = null;
let lastCrankSample = null;
let lastCadenceTimestamp = 0;
let staleIntervalId = null;

function setStatus(text) {
    statusElement.textContent = text;
}

function updateCadence(value) {
    cadenceValueElement.textContent = Number.isFinite(value) ? String(Math.max(0, Math.round(value))) : "--";
}

function setSelectedTheme(themeName) {
    document.body.dataset.theme = themeName;
    localStorage.setItem(STORAGE_KEYS.theme, themeName);
    if (themeSelect) {
        themeSelect.value = themeName;
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "night-rider";
    setSelectedTheme(savedTheme);
}

function loadAutoReconnectPreference() {
    const enabled = localStorage.getItem(STORAGE_KEYS.autoReconnect) === "true";
    autoReconnectCheckbox.checked = enabled;
}

function setSavedSensorDisplay(name) {
    savedSensorElement.textContent = name || "None";
}

function saveSelectedDevice(deviceToSave) {
    localStorage.setItem(STORAGE_KEYS.savedDeviceId, deviceToSave.id);
    localStorage.setItem(STORAGE_KEYS.savedDeviceName, deviceToSave.name || "Cadence sensor");
    setSavedSensorDisplay(deviceToSave.name || "Cadence sensor");
}

function clearCadenceState() {
    lastCrankSample = null;
    updateCadence(0);
}

function updateControlState(isConnected) {
    connectButton.disabled = isConnected;
    reconnectButton.disabled = isConnected;
    disconnectButton.disabled = !isConnected;
}

function parseCadenceFromMeasurement(dataView) {
    const flags = dataView.getUint8(0);
    let offset = 1;

    if (flags & 0x01) {
        offset += 6;
    }

    if ((flags & 0x02) === 0) {
        return null;
    }

    const cumulativeCrankRevolutions = dataView.getUint16(offset, true);
    const lastCrankEventTime = dataView.getUint16(offset + 2, true);
    return { cumulativeCrankRevolutions, lastCrankEventTime };
}

function computeCadenceRpm(currentSample) {
    if (!lastCrankSample) {
        lastCrankSample = currentSample;
        return null;
    }

    const crankDelta = (currentSample.cumulativeCrankRevolutions - lastCrankSample.cumulativeCrankRevolutions + 0x10000) % 0x10000;
    const timeDelta = (currentSample.lastCrankEventTime - lastCrankSample.lastCrankEventTime + 0x10000) % 0x10000;
    lastCrankSample = currentSample;

    if (timeDelta === 0) {
        return null;
    }

    const rpm = (crankDelta * 60 * 1024) / timeDelta;
    if (!Number.isFinite(rpm)) {
        return null;
    }

    return Math.max(0, rpm);
}

function onCscMeasurement(event) {
    const sample = parseCadenceFromMeasurement(event.target.value);
    if (!sample) {
        setStatus("Connected, waiting for crank cadence data...");
        return;
    }

    const cadence = computeCadenceRpm(sample);
    lastCadenceTimestamp = Date.now();

    if (cadence !== null) {
        updateCadence(cadence);
        setStatus("Connected and receiving cadence");
    }
}

function onDeviceDisconnected() {
    updateControlState(false);
    setStatus("Sensor disconnected");
    clearCadenceState();
}

async function connectToSelectedDevice(selectedDevice, isReconnect) {
    device = selectedDevice;

    if (!device) {
        throw new Error("No cadence sensor selected.");
    }

    if (!device.gatt) {
        throw new Error("This browser does not provide Bluetooth GATT access for the selected device.");
    }

    setStatus(isReconnect ? "Reconnecting to saved sensor..." : "Connecting to sensor...");
    device.removeEventListener("gattserverdisconnected", onDeviceDisconnected);
    device.addEventListener("gattserverdisconnected", onDeviceDisconnected);

    const server = await device.gatt.connect();
    const cscService = await server.getPrimaryService(CSC_SERVICE_UUID);
    cscMeasurementCharacteristic = await cscService.getCharacteristic(CSC_MEASUREMENT_UUID);
    await cscMeasurementCharacteristic.startNotifications();
    cscMeasurementCharacteristic.removeEventListener("characteristicvaluechanged", onCscMeasurement);
    cscMeasurementCharacteristic.addEventListener("characteristicvaluechanged", onCscMeasurement);

    updateControlState(true);
    updateCadence(0);
    setStatus("Connected. Start pedaling!");
    saveSelectedDevice(device);
}

async function connectSensor() {
    if (!("bluetooth" in navigator)) {
        setStatus("Web Bluetooth is not supported in this browser.");
        return;
    }

    try {
        const selectedDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CSC_SERVICE_UUID] }]
        });
        await connectToSelectedDevice(selectedDevice, false);
    } catch (error) {
        if (error && error.name === "NotFoundError") {
            setStatus("No sensor selected.");
            return;
        }
        setStatus(`Connection failed: ${error.message}`);
    }
}

async function reconnectSavedSensor() {
    if (!("bluetooth" in navigator)) {
        setStatus("Web Bluetooth is not supported in this browser.");
        return;
    }

    if (typeof navigator.bluetooth.getDevices !== "function") {
        setStatus("Reconnect requires browser support for previously approved Bluetooth devices.");
        return;
    }

    const savedDeviceId = localStorage.getItem(STORAGE_KEYS.savedDeviceId);
    if (!savedDeviceId) {
        setStatus("No saved sensor found. Connect once first.");
        return;
    }

    try {
        const devices = await navigator.bluetooth.getDevices();
        const savedDevice = devices.find((knownDevice) => knownDevice.id === savedDeviceId);
        if (!savedDevice) {
            setStatus("Saved sensor not available. Use Connect sensor to re-authorize.");
            return;
        }

        await connectToSelectedDevice(savedDevice, true);
    } catch (error) {
        setStatus(`Reconnect failed: ${error.message}`);
    }
}

function disconnectSensor() {
    if (device && device.gatt && device.gatt.connected) {
        device.gatt.disconnect();
    }
}

function startStaleCadenceWatcher() {
    if (staleIntervalId) {
        window.clearInterval(staleIntervalId);
    }

    staleIntervalId = window.setInterval(() => {
        const isConnected = Boolean(device && device.gatt && device.gatt.connected);
        if (!isConnected) {
            return;
        }

        if (lastCadenceTimestamp && Date.now() - lastCadenceTimestamp > STALE_TIMEOUT_MS) {
            updateCadence(0);
        }
    }, 1000);
}

async function attemptAutoReconnect() {
    const canReconnect = localStorage.getItem(STORAGE_KEYS.autoReconnect) === "true";
    if (!canReconnect) {
        return;
    }

    await reconnectSavedSensor();
}

function initialize() {
    loadTheme();
    loadAutoReconnectPreference();
    updateControlState(false);
    setSavedSensorDisplay(localStorage.getItem(STORAGE_KEYS.savedDeviceName));
    startStaleCadenceWatcher();

    if (!("bluetooth" in navigator)) {
        setStatus("Web Bluetooth is not supported in this browser.");
        reconnectButton.disabled = true;
        connectButton.disabled = true;
        return;
    }

    setStatus("Ready to connect.");

    connectButton.addEventListener("click", connectSensor);
    reconnectButton.addEventListener("click", reconnectSavedSensor);
    disconnectButton.addEventListener("click", disconnectSensor);

    autoReconnectCheckbox.addEventListener("change", (event) => {
        localStorage.setItem(STORAGE_KEYS.autoReconnect, event.target.checked ? "true" : "false");
    });

    if (themeSelect) {
        themeSelect.addEventListener("change", (event) => {
            setSelectedTheme(event.target.value);
        });
    }

    attemptAutoReconnect().catch((error) => {
        setStatus(`Auto reconnect failed: ${error.message}`);
    });
}

initialize();
