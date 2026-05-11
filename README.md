# CheckMiete.de

**Is your German rent fair?** — A free rent fairness checker based on official Mietspiegel data.

🌐 **Live:** [checkmiete.de](https://checkmiete.de) *(coming soon)*

---

## What it does

CheckMiete.de lets any renter in Munich or Berlin check whether their rent is fair, legal, and how it compares to the official market benchmark — in under 30 seconds.

**Based on legally binding official data:**
- 🏔️ **Munich** — Mietspiegel für München 2025 (approved by Munich City Council, 26 March 2025)
- 🏛️ **Berlin** — Berliner Mietspiegel 2023 (published by Senate for Urban Development, June 2023)

The same data German courts use in rent disputes.

---

## Features

- ✅ 4-step guided form (apartment size, year, location, features)
- ✅ Real-time fair rent calculation
- ✅ Visual meter showing where your rent sits
- ✅ Full price breakdown (base price + location + equipment)
- ✅ Legal context (Mietpreisbremse, 15% cap rule)
- ✅ Free advice contacts per city
- ✅ Mobile-friendly
- ✅ No backend required — pure static HTML/CSS/JS
- ✅ No tracking, no cookies, no signup

---

## Data Sources

### Munich — Mietspiegel 2025
- **Source:** Landeshauptstadt München, Statistisches Amt + Sozialreferat
- **Approved:** 26 March 2025 by Munich City Council
- **Based on:** 3,214 real rental contracts (Feb 2018 – Jan 2024)
- **Covers:** ~500,000 freely financed apartments in Munich
- **Average net rent:** €15.38/m²
- **Official calculator:** [mietspiegel-muenchen.de](https://2025.mietspiegel-muenchen.de)

### Berlin — Mietspiegel 2023
- **Source:** Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen
- **Published:** June 2023 (einfacher Mietspiegel, index-based from 2021)
- **Based on:** 16,000+ rental data points
- **Covers:** ~1.4M apartments in Berlin
- **Official portal:** [mietspiegel.berlin.de](https://mietspiegel.berlin.de)

---

## How to Use / Deploy

This is a purely static site. No build step, no dependencies.

**Option 1 — GitHub Pages (this repo)**
1. Fork this repo
2. Go to Settings → Pages → Deploy from branch `main`
3. Done — it will be live at `yourusername.github.io/checkmiete`

**Option 2 — Any static host**
Upload the folder to Netlify, Vercel, or any web server. No configuration needed.

**Option 3 — Local**
```bash
git clone https://github.com/YOUR_USERNAME/checkmiete.git
cd checkmiete
# Open index.html in browser — or serve with:
python3 -m http.server 8080
```

---

## Project Structure

```
checkmiete/
├── index.html          # Main app (HTML structure)
├── css/
│   └── style.css       # All styles (DM Serif Display + DM Sans, warm cream theme)
├── js/
│   ├── data.js         # All Mietspiegel data (Munich 2025 + Berlin 2023)
│   └── app.js          # Application logic (calculation, UI, navigation)
└── README.md
```

---

## Roadmap

- [ ] Frankfurt — Mietspiegel 2024
- [ ] Hamburg — Mietspiegel 2023
- [ ] Cologne — Mietspiegel 2022
- [ ] German language version
- [ ] Street-level location lookup for Berlin (Straßenverzeichnis API)
- [ ] Share result as image
- [ ] Historical rent trend chart

---

## Legal Notice

CheckMiete.de is an independent tool and is not affiliated with any German city authority. The calculations are based on publicly available, legally binding Mietspiegel data. For binding legal advice, consult a Mieterverein or a licensed attorney.

**Free advice:**
- Munich: Amt für Wohnen und Migration · Franziskanerstraße 8 · 089 233-40200
- Berlin: Berliner Mieterverein · 030 226 260 · berliner-mieterverein.de

---

## License

MIT License — free to use, fork, and deploy.
