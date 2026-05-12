# SafeNest — Smart Society Security Platform

A full-stack society security & visitor management app built with **React + Vite + Capacitor** (frontend) and **Node.js + Express + SQLite** (backend).

---

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd server
node index.js
```
> Running at `http://localhost:3009`

### 2. Start the Frontend
```bash
cd mob2
npm run dev
```
> Running at `http://localhost:5174` (or similar)

---

## 🔑 Test Accounts

Use these phone numbers to log in. The OTP is always **`123456`**.

| Role | Phone Number | Access |
|------|-------------|--------|
| 🏠 **Resident** | `+91 9876543211` | Pre-approve guests, view visitors, household |
| 🛡️ **Guard** | `+91 9876543212` | QR scanner, visitor log, SOS alerts |
| 🔧 **Helper / Staff** | `+91 9876543213` | Staff profile view |
| ⚙️ **Admin** | `+91 9876543214` | User management, card management, overview |

> **OTP (all accounts):** `123456`  
> **Dev hint:** The OTP is also shown on the verify screen during local development.

---

## ✨ Features by Role

### Resident
- Pre-approve guests with a scannable QR pass (24hr validity)
- View and manage active guest passes (view / delete)
- See who is currently inside the society live
- Household member management

### Guard
- **Real camera QR scanner** — tap to scan visitor QR codes
- Auto-verifies QR code against backend and logs entry
- Search staff by phone / ID and log entry manually
- View list of everyone currently inside (with Mark Exit)
- SOS / Alert button that immediately notifies admin

### Admin
- Society dashboard — resident, guard, helper & alert counts
- Pending user approvals — approve or reject with one tap
- Card management — view all staff cards, revoke access

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| Mobile | Capacitor (Android / iOS) |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` + Drizzle ORM |
| Auth | JWT (30-day expiry) |
| QR Scan | `html5-qrcode` (native camera API) |

---

## 🔌 Switching Database (SQLite ↔ MySQL)

In `server/.env`:
```env
# Local development (default)
DB_DIALECT=sqlite

# Production / remote MySQL
DB_DIALECT=mysql
DB_HOST=your-host
DB_USER=your-user
DB_PASS=your-password
DB_NAME=safenest
```

---

## 📱 Build for Android

```bash
cd mob2
npm run build
npx cap sync
npx cap open android
```
