# 👟 UNISOLE — Footwear E-Commerce Platform

A production-ready, full-stack e-commerce platform for footwear with a responsive storefront, secure authentication, Razorpay payments, and a complete admin dashboard.

🔗 **Live Demo:** https://unisole.onrender.com

---

## ✨ Features

### Customer
- Browse & filter products by category (Men / Women) with search
- Product detail pages with **per-size stock selection (UK 6–10)**
- Real-time stock validation — out-of-stock sizes are disabled, quantity capped per size
- Shopping cart keyed by **product + size** (e.g. UK 8 and UK 9 are separate lines)
- Checkout with **Razorpay** (UPI / Cards / Net Banking) and **Cash on Delivery**
- Order history with per-item size details and order status tracking
- User profile with Google sign-in option

### Admin
- Dashboard with sales & stock statistics (in-stock / low-stock counts)
- Product management: add, edit, delete, Cloudinary image uploads
- Per-size inventory editor with live total stock
- Order management: view full order details (items, sizes, customer, payment) and update status

### Engineering
- JWT-based authentication with role-based access control (customer vs admin)
- RESTful API built with Express.js and MongoDB (Mongoose)
- SPA fallback for direct URL access in production
- Production build & CI/CD via Render (auto-deploys from GitHub)

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT, bcryptjs, Google OAuth (Passport) |
| Payments | Razorpay |
| Media | Cloudinary |
| Deployment | Render (CI/CD from GitHub) |

---

## 📁 Project Structure

```
├── server.js                 # Express entry point
├── config/                   # Cloudinary, Razorpay, etc.
├── controllers/              # Route handlers
├── middleware/               # Auth & admin middleware
├── models/                   # Mongoose models (Product, Cart, Order, User)
├── routes/                   # Express routes
├── react-frontend/           # React + Vite client
│   ├── src/
│   │   ├── api/              # API client & services
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth, Cart, Toast contexts
│   │   ├── pages/            # Storefront & admin pages
│   │   ├── utils/            # Helpers & validators
│   │   └── App.jsx           # Route definitions
└── .env.example              # Environment template
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (image hosting)
- Razorpay account (payments)

### 1. Clone & install

```bash
git clone https://github.com/aakashkoli330-cloud/UNISOLE.git
cd UNISOLE
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the required values — see [Environment Variables](#-environment-variables).

### 3. Set frontend environment

The Vite client reads `VITE_RAZORPAY_KEY_ID` and `VITE_GOOGLE_CLIENT_ID` from `react-frontend/.env` (create it if needed). For local development the Razorpay test key fallback in `src/config.js` may be sufficient.

### 4. Run locally

```bash
npm run dev        # starts the API server (nodemon) on http://localhost:5000
```

In a second terminal, run the Vite client:

```bash
cd react-frontend
npm run dev        # http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root (and `react-frontend/.env` for Vite vars):

| Variable | Description |
| --- | --- |
| `PORT` | API server port (default `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (frontend) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (frontend) |

> ⚠️ **Never commit `.env`.** Rotate secrets (especially `MONGO_URI` and `JWT_SECRET`) regularly. For production, set these in the Render dashboard's Environment tab.

---

## 📦 Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the API server (production) |
| `npm run dev` | Start the API server with nodemon |
| `npm run build` | Install & build the React client |
| `cd react-frontend && npm run dev` | Run the Vite dev server |

---

## 🧠 Key Design Decisions

- **Per-size inventory** — each product stores `sizes: [{ size, stock }]`; the legacy `stock` field is kept in sync as the total so older views continue to work. Stock is checked and decremented per purchased size.
- **Cart identity** — cart items are matched by `product + size`, allowing the same shoe in multiple sizes on one cart.
- **Route order matters** — admin order routes are registered before `/:id` to avoid route conflicts.
- **SPA fallback** — a catch-all Express route serves `index.html` so direct URL refreshes work in production.

---

## 🗺️ Roadmap

- [ ] Order cancellation & refunds
- [ ] Product reviews & ratings
- [ ] Discount coupons & offers
- [ ] Email order confirmations
- [ ] Pagination & advanced search filters

---

## 📝 License

This project is for educational/portfolio purposes.

---

Made with 💙 — built as a full-stack portfolio project.
