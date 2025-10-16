# 🦉 Hedwige Mail

A full-stack web app inspired by Gmail — built with **Node.js**, **Express**, and **Google OAuth2**. It allows users to **log in with Google**, **read their inbox**, and **send emails** directly from the web interface.

---

## ✨ Features

* 🔐 Google OAuth2.0 Authentication (secure login)
* 📬 Read Gmail inbox messages
* 💌 Send emails directly through Gmail API
* 🧠 Session management using Express sessions
* 🎨 Modern and colorful responsive UI
* 🧩 Configurable environment via `.env`

---

## ⚙️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **API:** Google Gmail API via googleapis
* **Auth:** OAuth 2.0
* **Env:** dotenv

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/hedwige-mail.git
cd hedwige-mail
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → name: **Hedwige Mail**
3. Set up the **OAuth consent screen** → *External* type
4. Add your Gmail as a **Test User**
5. Enable the **Gmail API** in API Library
6. Create **OAuth Client ID** credentials (Web Application):

   * Authorized JavaScript origins: `http://localhost:5000`
   * Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
7. Copy your Client ID and Secret

### 4️⃣ Add environment variables

Create a `.env` file in the root:

```dotenv
PORT=5000
SESSION_SECRET=your-random-secret
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,openid,profile,email
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Run the app

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) 🎉

---

## 🧠 Folder Structure

```
hedwige-mail/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── auth.js
│   ├── gmail.js
│   └── utils.js
├── .env
├── server.js
└── package.json
```

---

## 💡 Notes

* Only added Gmail accounts listed in your **Test Users** can log in (in Testing mode).
* Ensure Gmail API is **enabled** in your project.
* To make it public, switch your app status to **Production** in Google Cloud.

---

## 🧑‍💻 Author

Built with ❤️ by [Your Name] — EPSI M2 Workshop Project

---

## 📜 License

This project is open-source under the MIT License.
