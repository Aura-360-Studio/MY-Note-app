# 🗒️ MY Note

> **A premium, serverless, offline-first procedural workspace.**
> An experiment from **Aura Labs**, powered by **AURA360STUDIO**.
>
> 🌐 **Live Demo:** [labs.aura360studio.com](https://labs.aura360studio.com/)
> 📂 **Source Repository:** [github.com/Aura-360-Studio/MY-Note-app](https://github.com/Aura-360-Studio/MY-Note-app)

---

## 🌟 Introduction

**MY Note** is an elegant, local-first note-taking application designed with terminal-like speed and desktop-grade styling. Operating under absolute user sovereignty, it stores all data strictly within the user's browser, functioning seamlessly offline without registration, sync servers, or trackers.

This project is released under the copyleft **GNU General Public License v3.0 (GPLv3)**.

---

## 🚀 Key Features

### 1. Premium Brand Integrations
* **Animated Splash Screen:** Starts with a glowing radial gradient backdrop and a sliding progress bar animation, unmounting gracefully from the DOM after initialization.
* **Header & Sidebar Branding:** Integrates custom high-fidelity landscape logo assets aligned next to menu elements.
* **Branded Favicon:** Fully customized PNG browser favicon and PWA touch icons.

### 2. Dedicated Settings Panel (Notepad Style)
* **Word Wrap & Status Bars:** Real-time toggles for distraction-free text editing matching Microsoft Windows 11 style patterns.
* **Editor Customization:** Change editor fonts dynamically (Geist, JetBrains Mono, Segoe UI, Consolas, Courier New).
* **Workspace Profile:** Move name/profile forms into a sidebar card, including transaction-safe commit/reversion operations.

### 3. Active Backup & Alert Systems
* **Dynamic JSON Workspace Sync:** Export and import entire notebooks, projects, and editor preferences with collision-safe timestamped filenames (`YYYY-MM-DD-HH-MM-SS`).
* **Active Backup Math Logs:** Evaluates calendar-based age intervals (days, months, years) since your last manual backup.
* **Header Bell Notifications:** Alerts users with a pulsing alert badge and a quick-action dropdown menu if modifications are outstanding or backups are overdue.

### 4. Safety Safeguards & Custom Modals
* **Hard Refresh System Reset:** Triggers a custom `z-[110]` modal instructing the user on cache cleanups, unregistering service workers, and erasing IndexedDB tables safely.
* **Legal Statements Modal:** Dynamic modal displaying individually:
  * **GNU GPLv3 License terms** with direct repository linkages.
  * **Services Agreement** emphasizing offline, as-is usage disclaimers.
  * **Privacy Statement** detailing local client-side IndexedDB storage.
  * **Third-Party Acknowledgments** thanking core frameworks alongside **GitHub** and **Vercel**.

---

## 🛠️ Technology Stack

MY Note is built using modern, lightning-fast client technologies:
* **Core:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
* **State Management:** [Zustand 5](https://github.com/pmndrs/zustand) (ultra-minimal reactive store)
* **Local Storage Wrapper:** [Dexie.js](https://dexie.org/) (elegant wrapper for client-side IndexedDB databases)
* **Markdown Text Editor:** [CodeMirror 6](https://codemirror.net/) (highly modular inputs)
* **Bundler & Orchestration:** [Vite 6](https://vite.dev/)
* **Validation:** [Zod](https://zod.dev/)

---

## 💻 Developer Setup & Commands

Follow these steps to run MY Note in your local developer sandbox:

### 1. Installation
Clone the repository and install all Node dependencies:
```bash
git clone https://github.com/Aura-360-Studio/MY-Note-app.git
cd "MY-Note-app"
npm install
```

### 2. Launch Local Dev Server
Fire up the Vite development server locally (accessible at `http://localhost:5173/`):
```bash
npm run dev
```

### 3. Validate Types
Verify that all types and property interfaces compile cleanly:
```bash
npm run build
# OR tsc --noEmit
```

### 4. Run Unit Tests
Execute the Vitest testing suite to verify validation schemas:
```bash
npm run test
```

---

## 📄 License

MY Note is licensed under the copyleft **GNU General Public License v3.0**. See the [LICENSE](file:///c:/Users/kidos/Documents/note%20taking%20app/LICENSE) file in the root directory for the complete terms and conditions.

---

*Made with ❤️ by Aura Labs and powered by AURA360STUDIO.*
