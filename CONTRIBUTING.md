# 🤝 Contributing to WallpGen

First off, thank you for considering contributing to **WallpGen**! It's open-source projects and developer contributions that make web tools awesome.

Whether you want to report a bug, propose a feature, add new color palettes, or write procedural canvas patterns, this guide will help you get started quickly.

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and welcoming environment for everyone. Please keep discussions constructive and professional.

---

## 🚀 Getting Started

### 1. Prerequisites
WallpGen is designed with **zero heavy dependencies** (Pure Vanilla JavaScript + Canvas 2D API). All you need is:
* Modern Web Browser (Chrome, Firefox, Safari, Edge)
* [Node.js](https://nodejs.org/) (optional, only for running local builds or server tooling)
* [Git](https://git-scm.com/)

### 2. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your local fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wallpgen.git
   cd wallpgen
   ```
3. Run a simple HTTP server:
   ```bash
   # Using Python 3
   python3 -m http.server 8080

   # Or using Node npx
   npx serve .
   ```
4. Open [`http://localhost:8080`](http://localhost:8080) in your browser.

---

## 🛠️ Project Structure

Understanding the layout of the repository:

```
wallpgen/
├── index.html                    # Main HTML entry point
├── src/
│   ├── engine.js                 # Core engine: PATTERNS, PALETTES, Canvas 2D renderers
│   ├── create.js                 # App state & UI event listeners
│   ├── translate.js              # i18n engine and dictionaries
│   ├── index.js                  # Theme & language initialization
│   └── animations-interaction.js # UI micro-interactions & ripple effects
├── css/
│   ├── style.css                 # Main layout & component styles
│   ├── index.css                 # Design tokens & CSS variables
│   └── animations.css            # Keyframe animations
├── assets/                       # Icons, flags & background images
└── CONTRIBUTING.md               # You are here!
```

---

## 🎨 How to Extend WallpGen

### Adding a New Algorithmic Pattern

All procedural renderers live in `src/engine.js`.

1. Define your generator function following the signature pattern:
   ```javascript
   function drawMyCustomPattern(context, width, height, paletteIndex, randomGen, isDarkMode) {
     // 1. Obtain color from current palette
     const primaryColor = getPaletteColor(paletteIndex, 0.5, isDarkMode);
     context.fillStyle = primaryColor;

     // 2. Perform Canvas 2D operations...
     context.fillRect(0, 0, width, height);
   }
   ```
2. Register your pattern key in the `PATTERNS` array:
   ```javascript
   const PATTERNS = [
     "flowing-hills",
     "smooth-wave",
     "sand-dunes",
     "mountains",
     "concentric-arcs",
     "desert-dunes",
     "my-custom-pattern" // <-- Add here
   ];
   ```
3. Add i18n translation labels in `src/translate.js` under `pattern.my-custom-pattern`.

---

### Adding a New Color Palette

Palettes are defined in `src/engine.js` as objects with 10 gradient color stops:

```javascript
PALETTES.push({
  name: "Cyberpunk Neon",
  colors: [
    "#0d0221",
    "#0f0826",
    "#26083b",
    "#540d6e",
    "#ee4266",
    "#ffd23f",
    "#3bceac",
    "#0ead69",
    "#70e4ef",
    "#f7f7ff"
  ]
});
```

---

### Adding a New Language (i18n)

Translations are handled in `src/translate.js`:

1. Add your language dictionary object inside the `translations` map:
   ```javascript
   const translations = {
     en: { ... },
     fr: { ... },
     es: { ... },
     it: {
       "preview.desktop": "Desktop 4K",
       "preview.mobile": "iPhone",
       "controls.pattern": "Motivo",
       "controls.generate": "GENERA VARIAZIONE",
       // ...
     }
   };
   ```
2. Update language resolution logic in `getAvailableLanguages()`.

---

## 📐 Coding Conventions & Guidelines

* **Pure Vanilla JS:** Avoid introducing external frameworks or heavy runtime libraries.
* **Canvas Performance:** Keep rendering algorithms optimized. Avoid memory leaks when creating temporary offscreen elements or Canvas contexts inside loops.
* **CSS Custom Properties:** Respect defined design tokens in `css/index.css` (e.g. `var(--bg)`, `var(--text)`, `var(--transition)`).
* **Responsive & Accessibility:** Ensure touch targets are at least 44x44px and dark/light modes transition smoothly.

---

## 🔀 Submitting a Pull Request (PR)

1. Create a feature branch off `main`:
   ```bash
   git checkout -b feature/awesome-new-pattern
   ```
2. Commit your changes with a clear, concise message:
   ```bash
   git commit -m "feat(engine): add cyberpunk neon palette and geometric grid pattern"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/awesome-new-pattern
   ```
4. Open a **Pull Request** against `main` on GitHub with:
   * A short description of the changes.
   * Screenshots or GIFs if UI/Canvas output was modified.

---

Thank you for helping make WallpGen better! 🚀