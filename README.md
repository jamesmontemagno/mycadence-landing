# My Cadence Landing Page

Static landing page for My Cadence, a real-time cadence display app for indoor cycling.

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
├── .gitignore          # Git ignore rules
├── README.md           # This file
├── CNAME               # Custom domain (optional)
└── assets/
    ├── images/         # Screenshots and marketing imagery
    │   ├── hero.png
    │   ├── pro-history.png
    │   └── lifestyle.png
    └── icons/          # App icon and badges (optional)
```

## Content

- **Hero Section**: App pitch with App Store and Google Play CTAs
- **Value Strip**: Three key value propositions
- **Pro Features**: Ride history and tracking capabilities
- **Lifestyle Section**: Real-world usage context
- **Core Features**: Privacy, offline support, design, and compatibility
- **Footer**: Support, privacy policy, and source code links

## Customization

All colors, spacing, and typography are defined in CSS custom properties at the top of `styles.css`:

```css
:root {
    --color-coral: #FF6B5B;
    --color-text-primary: #1A1A1A;
    /* ... more variables ... */
}
```

Update these values to match your branding.

## Responsive Design

The site is mobile-first and includes breakpoints for:
- Tablets (768px and below)
- Mobile phones (480px and below)
- Respects `prefers-reduced-motion` for accessibility

## Performance

- Zero external dependencies (no frameworks, no CDNs)
- Optimized image assets
- ~15KB total CSS
- Fast Time to First Byte (TTFB)
- No JavaScript required

## License

This landing page uses assets and content from the My Cadence app repository, which is licensed under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/).

## Support

For issues or suggestions about the landing page, please [email support](mailto:hello@refractored.com).
