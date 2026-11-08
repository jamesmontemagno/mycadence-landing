# My Cadence Landing Page

Static landing page for My Cadence, a real-time cadence display app for indoor cycling.

Includes a dedicated Web Bluetooth page (`web-edition.html`) that can connect to a cadence sensor, display live RPM, and save theme/reconnect preferences in the browser.

## Quick Start

1. Clone this repo
2. Open `index.html` in a browser
3. All assets and styles are included—no build step needed

## Deployment

### GitHub Pages

1. Push this repo to GitHub
2. Go to repo Settings → Pages
3. Select "Deploy from a branch"
4. Choose the branch (typically `main`) and click Save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Custom Domain

1. Create a file named `CNAME` in the repo root with your domain name
2. In repo Settings → Pages, set the custom domain
3. Update your domain's DNS settings to point to GitHub Pages

## File Structure

```
mycadence-landing/
├── index.html          # Main landing page
├── styles.css          # All styling (no external dependencies)
├── web-edition.html    # Web cadence display page
├── web-edition.css     # Styling for Web Edition
├── web-edition.js      # Web Bluetooth cadence logic
├── .gitignore          # Git ignore rules
├── README.md           # This file
├── CNAME               # Custom domain (optional)
└── assets/
    ├── images/         # App captures (AVIF, WebP, JPEG), cadence line SVG, social card
    └── icons/          # App icon and favicons
```

## Content

- **Hero**: "Your cadence, loud and clear." with App Store, Google Play, and Web Edition links
- **Features**: Ride, history, charts, achievements, Scenic, and Pro, each with iPad and iPhone captures
- **iPhone Duo**: One sideways-scrolling swimlane of open and closed layouts
- **Platforms**: Which features come with iPhone and iPad, Android, and Web Edition
- **Privacy**: What stays on the device, what Apple Health sync does, and what needs internet
- **Web Edition**: Browser-based cadence display with Bluetooth sensor connection and theme selection
- **Footer**: Download, privacy, support, Refractored, and Tiny Tool Town links

Check product claims against the app before changing copy, including which features are Pro and which are iOS-only. Use "My Cadence", with the space, in all copy and metadata.

## Customization

Colors and spacing are CSS custom properties at the top of `styles.css`. Section colors are set on `.band-dark` and `.band-light`:

```css
:root {
    --ink: #111113;
    --paper: #f2f2f7;
    --orange: #ff8d28;
}
```

The orange is deepened to `#d9600a` for headlines on light backgrounds, because `#ff8d28` only reaches 2.1:1 contrast there.

## Images

Each capture has two widths in AVIF and WebP, plus a JPEG fallback at the larger width. Add new ones in a `<picture>` with `width` and `height` set, and `loading="lazy"` below the fold. Don't use promo images with captions baked in; the page's own headlines do that job.

`assets/images/cadence-line.svg` draws the app's cadence curve, `84 + 8*sin(t/9) + 3*sin(t/2.3)`, in its chart zone colors: yellow up to 78 RPM, orange up to 84, and red above.

## Responsive Design

The layout has one column on phones and two from 960px up. It follows `prefers-color-scheme` for light and dark mode, and `prefers-reduced-motion` turns off the hero line's reveal and smooth scrolling.

## Performance

- Zero external dependencies (no frameworks, no CDNs)
- No analytics or trackers, because the site tells people there are none
- Landing page itself requires no JavaScript

## Web Edition Browser Support

- Requires a browser with [Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) support.
- Works best on Chromium-based browsers (Chrome/Edge), especially on Android and desktop.
- Some browsers do not support reconnecting to previously approved devices (`navigator.bluetooth.getDevices`), so users can always reconnect manually with **Connect sensor**.
- New visitors get the **Match system** theme. Saved theme choices keep working, and Night Rider now uses the site's near-black and orange.

## License

This landing page uses assets and content from the My Cadence app repository, which is licensed under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/).

## Support

For issues or suggestions about the landing page, please [email support](mailto:hello@refractored.com).
