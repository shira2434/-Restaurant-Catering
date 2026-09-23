# ☕ La Cucina — Catering App

Live site: https://shira-fullstack-project.vercel.app/login

A full-stack coffee & catering shop application built with React on the frontend and Node.js/Express on the backend.

---

## 🛠️ Technologies

**Frontend**
- React 19, React Router, Redux Toolkit
- Formik + Yup (forms & validation)
- Tailwind CSS + SCSS
- Axios

**Backend**
- Node.js + Express
- db.json (local database)

---

## 📁 Project Structure

```
├── src/
│   ├── api/          # API calls
│   ├── auth/         # Login & Register
│   ├── cart/         # Shopping cart & checkout
│   ├── components/   # Shared components
│   ├── layout/       # Navbar
│   ├── products/     # Product list, details, add product
│   ├── profile/      # User profile
│   ├── reviews/      # Reviews
│   ├── routes/       # Routing
│   └── store/        # Redux store
└── server/           # Express server
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Start the server

```bash
cd server
npm run dev
```

> Server runs on `http://localhost:3001`

### 3. Start the client

```bash
npm run dev
```

> App runs on `http://localhost:5173`

---

## ✨ Features

- User registration and login
- Browse product catalog
- Add products to cart and checkout
- Add reviews
- Manage personal profile
- Admin dashboard with live editing
