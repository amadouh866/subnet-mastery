# SubnetMaster 🌐

A fast, interactive, and professional subnetting mastery tool — designed for students and network engineers. No frameworks, no build step. Pure HTML + CSS + JS.

**Live Demo:** [https://amadouh866.github.io/subnet-mastery/](https://amadouh866.github.io/subnet-mastery/)

## 🚀 Key Features

- **Cheat Sheet** — Powers of 2, CIDR ↔ mask ↔ block size tables, formulas, and private ranges.
- **Interactive Bit Visualizer** — Click individual bits or use the slider to shift the network/host boundary in real-time.
- **Standard Calculator** — Enter any IP/prefix for instant subnet details (Network, Broadcast, Range, Mask, Wildcard).
- **VLSM Calculator** — Generate complex subnetting plans based on custom host requirements for multiple LANs.
- **Practice Drill (Quiz)** — Shuffled questions with category filters (Masks, Hosts, Calc), score tracking, and streaks.
- **Export Data** — Download your VLSM subnetting plans as CSV files.
- **Dark/Light Mode** — Seamless theme switching with persistent user preference.
- **PWA Ready** — Installable on mobile and desktop. Works **offline** once cached.
- **Keyboard Shortcuts** — Navigate tabs with `1-5` and use `Enter` for calculations and quiz flow.

## 📱 Installation (PWA)

Since this is a Progressive Web App, you can install it on your device:
- **Mobile:** Open the link in Chrome/Safari and select "Add to Home Screen".
- **Desktop:** Click the "Install" icon in the browser address bar.

## 🛠 Usage (local)

Just open `index.html` in any modern browser.

```bash
git clone https://github.com/amadouh866/subnet-mastery.git
cd subnet-mastery
# No installation required, just open index.html
```

## 📁 File Structure

```
subnet-mastery/
├── index.html     # App shell, markup & PWA registration
├── style.css      # Dark/Light themes and responsive layout
├── app.js         # Unified logic (Calculations, VLSM, Quiz, UI)
├── manifest.json  # PWA configuration
├── sw.js          # Service Worker for offline support
└── .nojekyll      # Ensures proper hosting on GitHub Pages
```

## 📜 License

MIT — free to use, share, and modify.
