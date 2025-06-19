
# 🌐 Website Dashboard Cloner & Offline Archiver

This project provides an automated way to **log in to web-based dashboards**, **navigate authenticated pages**, and **save full offline versions** of them, including **rendered HTML, CSS, JS, fonts, and assets**. It's built using [Playwright](https://playwright.dev/) and is ideal for:

- 🔄 Reverse-engineering dashboard UIs
- 📁 Creating offline documentation or demos
- 🔧 Rebuilding layouts with React + Tailwind CSS
- 💡 Studying protected dashboard structures

---

## 🚀 Features

- ✅ Headless or with head browser automation with Playwright
- ✅ Authenticated login support (username/password)
- ✅ Navigates and captures multiple dynamic routes
- ✅ Downloads external assets (CSS, JS, fonts, images)
- ✅ Saves rendered HTML content for full offline use
- ✅ Universal: works with any SPA or dashboard-style site

---

## 🛠️ Requirements

- [Node.js](https://nodejs.org/) v18+
- A terminal or shell
- Credentials (if the target site requires login)

Install dependencies:

```bash
npm install
```

---

## 📂 Folder Structure

```bash
.
├── download-site.js        # Main automation script
├── offline-site/           # Output folder
│   ├── dashboard.html
│   ├── settings.html
│   ├── ...
│   ├── assets/             # Downloaded JS, CSS
│   ├── files/              # Images, icons
│   └── fonts/              # Web fonts
└── README.md
```

---

## ⚙️ Usage

### 1. Configure Your Target

In `download-site.js`, replace the following:

```js
const baseUrl = 'https://example.com';
const loginUrl = `${baseUrl}/login`;

const loginCredentials = {
  username: 'your-username',
  password: 'your-password',
};

const urls = [
  'dashboard',
  'settings',
  'reports/sales',
  'reports/users',
  // Add as many routes as needed
];
```

> You must know the login form selectors and the page routes you want to scrape.

---

### 2. Run the Script

```bash
node download-site.js
```

This will:

- Launch a headless browser
- Log in using the provided credentials
- Visit each route
- Download the HTML and associated assets
- Save them into the `offline-site` folder

---

### 3. Preview Offline

You can serve the cloned files offline using:

```bash
npx live-server offline-site
# or
python -m http.server --directory offline-site
```

---

## 💡 Use Cases

- UI/UX analysis and rebuild in React or Vue
- Backup interface structure before redesign
- Demo a product dashboard without internet
- Study design or component usage offline

---

## ⚠️ Disclaimer

This tool is intended for **personal, educational, or authorized use only**.

Please ensure you:
- Have permission to access and download the content
- Do not violate terms of service of the target site

---

## 🙌 Credits

- Powered by [Playwright](https://playwright.dev/)
- File system tasks by [fs-extra](https://github.com/jprichardson/node-fs-extra)
- Built by Kingsley for developers

---

## 📬 Suggestions / Contributions

Feel free to fork, open an issue, or submit a PR to improve handling of logins, cookies, or dynamic routing. More features coming soon!
