# SubnetMaster 🌐

A fast, interactive subnetting mastery tool — cheat sheet, bit visualizer, techniques, calculator, and quiz drill. No frameworks, no build step. Pure HTML + CSS + JS.

## Features

- **Cheat Sheet** — powers of 2, CIDR ↔ mask ↔ block size tables, formulas, private ranges
- **Bit Visualizer** — drag a slider to see network/host bit split in real time
- **4 Techniques** — block size shortcut, counting host bits, fit N hosts, fit N subnets
- **Calculator** — enter any IP/prefix and get full subnet details + bit pattern + subnet list
- **Practice Drill** — 15 shuffled questions with score tracking and streak counter

## Usage (local)

Just open `index.html` in any browser — no server needed.

```bash
git clone https://github.com/YOUR_USERNAME/subnet-mastery.git
cd subnet-mastery
open index.html   # macOS
# or
start index.html  # Windows
```

## Deploy to GitHub Pages

### Option 1 — From GitHub UI (easiest)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under *Source*, select **Deploy from a branch**
4. Select `main` branch, `/ (root)` folder
5. Click **Save**
6. Your site will be live at `https://YOUR_USERNAME.github.io/subnet-mastery/`

### Option 2 — GitHub CLI

```bash
gh repo create subnet-mastery --public --push --source=.
# Then enable Pages in the repo settings
```

### Option 3 — Git commands

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/subnet-mastery.git
git push -u origin main
```

Then enable GitHub Pages in repository Settings → Pages.

## Deploy to Netlify (one-click)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop this folder onto the Netlify dashboard
3. Done — live URL in seconds

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## File Structure

```
subnet-mastery/
├── index.html   # App shell + all markup
├── style.css    # Dark terminal aesthetic
├── app.js       # All logic (no dependencies)
└── README.md    # This file
```

## License

MIT — free to use, share, and modify.
