# 🔍 CodeLens — AI Code Reviewer

A full-stack AI-powered code review SaaS with a **3D animated landing page** built with Three.js.

## 📁 Exact Folder Structure

```
codelens/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reviewController.js
│   │   └── historyController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── historyRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── CodeBlock.jsx
    │   │   ├── HistoryCard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ReviewResult.jsx
    │   │   ├── ScoreRing.jsx
    │   │   └── Spinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── HistoryPage.jsx
    │   │   ├── Landing.jsx        ← 3D animated landing page
    │   │   ├── Login.jsx
    │   │   ├── ReviewDetail.jsx
    │   │   ├── ReviewPage.jsx
    │   │   └── Signup.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 How to Run

### Step 1 — Backend
```bash
cd codelens/server
npm install
npm run dev
# ✅ Server at http://localhost:5000
```

### Step 2 — Frontend (new terminal)
```bash
cd codelens/client
npm install
npm run dev
# ✅ App at http://localhost:5173
```

### Step 3 — Open browser
Go to **http://localhost:5173** — you'll see the 3D animated landing page!

## 🌐 Deploy

**Backend → Render.com**
1. New Web Service → connect GitHub repo
2. Root Directory: `server`
3. Build: `npm install` | Start: `node server.js`
4. Add env vars from `.env`

**Frontend → Vercel**
1. New Project → connect repo
2. Root Directory: `client`
3. Framework: Vite
4. Env: `VITE_API_URL=https://your-render-url.onrender.com`
