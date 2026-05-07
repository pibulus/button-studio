# 🔧 TINKER.md - ButtonSpa Quick Reference

_For when you haven't touched this in 6 months and need to change something NOW_

---

## 🚀 START HERE - RUN THE DAMN THING

### Dev Mode

```bash
deno task start
# Opens at http://localhost:8000
```

### Production Build

```bash
deno task build
deno task preview
```

---

## 📁 FILE MAP - WHERE SHIT LIVES

```
button_studio/
├── main.ts                # Production entry point
├── dev.ts                 # Dev server entry
├── routes/                # All the pages
│   ├── index.tsx         # Homepage
│   └── button-lab.tsx    # Main button designer
├── islands/              # Interactive components
└── static/               # CSS, images, downloads
```

### The 5 Files That Matter Most:

1. **routes/index.tsx** - Homepage with the pitch
2. **routes/button-lab.tsx** - The actual button designer
3. **islands/ButtonStudio.tsx** - Main interactive component
4. **static/styles.css** - Global styles if any
5. **deno.json** - Config and scripts

---

## 🎯 QUICK WINS - 80% OF WHAT YOU'LL CHANGE

### 1. Change the Main Text/Copy

```
File: routes/index.tsx
Line: Look for the <h1> and <p> tags
What: "Make cute buttons that do real things." → Your new tagline
```

### 2. Change Colors/Theme

```
File: tailwind.config.ts
Look for: theme colors
Current: Using Tailwind defaults
Options: Add your pablo palette colors
```

### 3. Change Default Button Style

```
File: islands/ButtonStudio.tsx
Look for: defaultButtonStyle or initial state
Current: Probably some pastel setup
Change to: Your preferred defaults
```

---

## 🔧 COMMON TWEAKS

### Add a New Page/Route

```bash
# Create new route file:
Create: routes/newpage.tsx
Copy from: routes/index.tsx
Change: export default function NewPage()
Visit: http://localhost:8000/newpage
```

### Change Port

```bash
File: deno.json
Look for: PORT=8000
Change to: PORT=3000 (or whatever)
```

### Add/Remove Feature

```bash
# Find the feature:
grep -r "feature_name" .

# Comment it out in the TSX:
{/* DISABLED: <FeatureComponent /> */}
```

### Change App Name/Title

```bash
File: routes/_app.tsx
Look for: <title> in the <head>
Change: "ButtonSpa" → "Your Name"
```

---

## 💥 WHEN SHIT BREAKS - TOP 3 FIXES

### 1. Port Already in Use

```bash
# Find what's using port 8000:
lsof -i :8000

# Kill it:
kill -9 [PID]

# Or just change the port in deno.json
```

### 2. Dependencies Fucked

```bash
# Clear Deno cache:
rm deno.lock
deno cache --reload dev.ts

# Clear Fresh cache:
rm -rf _fresh
```

### 3. Build Fails

```bash
# Clean everything:
rm -rf _fresh node_modules

# Fresh restart:
deno task manifest
deno task start
```

---

## 🚦 DEPLOYMENT - SHIP IT

### One-Liner Deploy

```bash
# Deno Deploy (if connected):
deployctl deploy --prod --project=pabloalvara-button-stud-57

# Or push to GitHub and let Deno Deploy auto-deploy
git push origin main
```

### Manual Deploy Steps

1. Build it: `deno task build`
2. Test it: `deno task preview`
3. Push it: `git push origin main`
4. Deploy: Check https://dash.deno.com

---

## 📝 NOTES FOR FUTURE PABLO

- Twind is BROKEN - use regular Tailwind CSS plugin
- The button export creates a self-contained HTML file
- Sound features need Web Audio API support
- Fresh islands auto-hydrate, don't overthink it

---

## 🎸 QUICK REFERENCE

- **Start dev**: `deno task start`
- **Build prod**: `deno task build`
- **Deploy**: `deployctl deploy --prod`
- **Main page**: routes/index.tsx
- **Button designer**: routes/button-lab.tsx
- **Change colors**: tailwind.config.ts
- **When fucked**: Delete _fresh folder

---

_Your tiny action app builder - shipped at buttonspa.app_
