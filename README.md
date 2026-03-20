# 🎟️ TicketX — Ticket Trading Platform

A full-stack MERN application for event ticket trading with dynamic pricing, wallet payments, and Razorpay integration.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Fill in your values:
#   MONGODB_URI   → MongoDB Atlas connection string
#   JWT_SECRET    → Any random long string
#   RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET → From razorpay.com dashboard
#   PORT=5000
```

### 3. Run

```bash
# Terminal 1 – Backend (port 5000)
cd backend
npm run dev

# Terminal 2 – Frontend (port 3000)
cd frontend
npm start
```

App opens at **http://localhost:3000**

---

## ✅ Features Implemented

| Feature | Details |
|---|---|
| **Auth with bcrypt.js** | Register/Login, JWT tokens, password hashed with bcrypt (10 rounds) |
| **Event management** | Any user can create events; admins have full CRUD |
| **List tickets for sale** | Sellers set custom prices, seat numbers, and categories |
| **Buy tickets** | Deducted from wallet balance, ownership transferred instantly |
| **Cancel listings** | Sellers can cancel available listings |
| **Dynamic price matching** | `/api/tickets/match/:eventId` returns lowest-priced tickets sorted for instant matching |
| **Wallet system** | Each user has a wallet balance; all trades use wallet |
| **Razorpay integration** | Wallet top-up via UPI/cards/netbanking, signature-verified |
| **Order history** | Full buy/sell history with party info and status |
| **Transaction history** | Every wallet debit/credit logged with balance-after |

---

## 📁 Project Structure

```
ticket-trading/
├── backend/
│   ├── models/
│   │   ├── User.js          # bcrypt password hashing
│   │   ├── Event.js
│   │   ├── Ticket.js        # indexed for dynamic matching
│   │   ├── Order.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js          # /api/auth
│   │   ├── events.js        # /api/events
│   │   ├── tickets.js       # /api/tickets
│   │   ├── orders.js        # /api/orders
│   │   └── payments.js      # /api/payments (Razorpay)
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly
│   └── server.js
└── frontend/
    └── src/
        ├── context/AuthContext.js
        ├── services/api.js  (Axios + JWT interceptor)
        ├── components/
        │   ├── Navbar.js
        │   └── PrivateRoute.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Events.js       # Home + search + filter
            ├── EventDetail.js  # Buy, sell, dynamic matching
            ├── MyTickets.js    # Cancel listings
            ├── Orders.js       # Order + transaction history
            ├── Wallet.js       # Razorpay top-up
            └── CreateEvent.js
```

---

## 🔑 API Endpoints

### Auth
| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET  | `/api/auth/me` | 🔒 |

### Events
| Method | Route | Auth |
|---|---|---|
| GET  | `/api/events` | Public |
| GET  | `/api/events/:id` | Public |
| POST | `/api/events` | 🔒 |
| PUT  | `/api/events/:id` | 🔒 Owner/Admin |
| DEL  | `/api/events/:id` | 🔒 Owner/Admin |

### Tickets
| Method | Route | Auth |
|---|---|---|
| GET   | `/api/tickets/event/:eventId` | Public |
| GET   | `/api/tickets/match/:eventId` | Public (dynamic matching) |
| GET   | `/api/tickets/my` | 🔒 |
| POST  | `/api/tickets/list` | 🔒 |
| POST  | `/api/tickets/buy/:ticketId` | 🔒 |
| PATCH | `/api/tickets/cancel/:ticketId` | 🔒 Seller only |

### Orders & Transactions
| Method | Route | Auth |
|---|---|---|
| GET | `/api/orders/my` | 🔒 |
| GET | `/api/orders/transactions` | 🔒 |

### Payments
| Method | Route | Auth |
|---|---|---|
| POST | `/api/payments/create-order` | 🔒 |
| POST | `/api/payments/verify` | 🔒 |

---

## 🛠️ Tech Stack

- **MongoDB Atlas** – database
- **Express.js** – REST API
- **React** (CRA) + React Router v6 – frontend
- **Node.js** – runtime
- **bcrypt.js** – password hashing
- **JWT** – authentication
- **Razorpay** – payment gateway
