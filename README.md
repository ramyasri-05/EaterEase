# The Cozy Table — Restaurant Reservation Management System

A full-stack, premium restaurant table reservation platform built with **React (Vite)**, **Node.js/Express**, and **MongoDB**. Features real-time table availability validation, double-booking prevention, role-based dashboards, and a conversational AI booking assistant.

- **Live Frontend (Vercel)**: https://restaurant-sand-pi.vercel.app
- **Live Backend (Render)**: https://restaurant-reservation-management-system-zgr7.onrender.com

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- npm v9+
- A MongoDB Atlas cluster (or local MongoDB running on `mongodb://127.0.0.1:27017`)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Vanamali13/Restaurant.git
cd Restaurant

# 2. Backend setup
cd backend
npm install

# Configure environment variables in /backend/.env:
# PORT=5000
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/restaurant_reservations
# JWT_SECRET=SuperSecretKeyForReservations_9872635
# NODE_ENV=development
# GEMINI_API_KEY=your_optional_gemini_key

# Seed database with initial tables and default user accounts:
npm run seed

# Start backend server:
npm run dev

# 3. Frontend setup (in a new terminal)
cd ../frontend
npm install
npm run dev
```

### Test Credentials

Once seeded via `npm run seed`, you can log in with the following credentials to test role-based features:

| Role | Email | Password | Access & Permissions |
|------|-------|----------|----------------------|
| **Customer** | `customer@gmail.com` | `customerpassword123` | Make reservations, view personal history, cancel own bookings, interact with AI assistant |
| **Administrator** | `admin@restaurant.com` | `adminpassword123` | View all reservations, filter by date, update/reschedule bookings, manage/toggle tables |

*Note: Public registration via the "Register" page is strictly customer-only. Administrator accounts cannot be created via public registration and must be provisioned/seeded in the database.*

---

## 📐 Assumptions Made

1. **Fixed & Pre-defined Time Slots** — The system utilizes predefined 1-hour time blocks (e.g. 12:00, 13:00, 18:00, 19:00). This ensures clear schedule boundary management and prevents partial overlaps.

2. **One Table per Reservation** — A single reservation covers one assigned table. Group bookings requiring multiple tables must make separate reservations.

3. **Same-Day Bookings Allowed** — Customers can reserve tables for today as long as the date is not in the past (`date >= YYYY-MM-DD`). Dates are stored as ISO-style `YYYY-MM-DD` strings to maintain timezone consistency.

4. **Cancellation Preserves History** — Cancelled reservations are soft-updated (`status: 'cancelled'`). They remain visible in history logs for both customer and admin views.

5. **Table Capacity is a Hard Limit** — A table with capacity 4 will strictly reject booking requests for 5 or more guests, even if no other booking exists for that table.

6. **Best-Fit Table Allocation** — When a customer requests an auto-assigned table, the system sorts available eligible tables by capacity in ascending order to assign the smallest appropriate table, minimizing seat wastage.

7. **No Payment Flow** — This system focuses on reservation, availability, and role-based seating management. Payment processing is out of scope.

8. **No Email/SMS Dispatch** — Email or SMS notifications are omitted. Status updates and confirmations are reflected dynamically in the UI dashboards.

---

## 📅 Reservation & Availability Logic

### How a Reservation is Created

1. **Parameter Input:** Customer selects a date (`YYYY-MM-DD`), time slot (e.g., `18:00`), and guest count.
2. **Availability Check (`GET /api/reservations/availability`):** The backend queries MongoDB for tables that:
   - Are currently marked active (`isActive: true`).
   - Have a seating capacity `>= requested guests`.
   - Are **not** already assigned to a `confirmed` reservation for that exact date and time slot.
3. **Table Assignment:** The customer picks a table option or accepts the auto-selected *Best Fit* table.
4. **Atomic Booking Guard:** Before saving, the backend re-validates availability to prevent race conditions.

### Conflict & Double-Booking Prevention

Double-booking is prevented across **4 distinct defense layers**:
1. **Query Filtering:** Active reservations (`confirmed` or `pending`) for the requested date and slot are excluded.
2. **Pre-Save Guard:** Checks `Reservation.findOne({ date, timeSlot, table: tableId, status: { $in: ['confirmed', 'pending'] } })`.
3. **Admin Reschedule Guard:** Ensures updates exclude the current reservation ID (`_id: { $ne: id }`).
4. **Partial Unique Index (Database Layer):**
   ```javascript
   reservationSchema.index(
     { table: 1, date: 1, timeSlot: 1 },
     { unique: true, partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } } }
   );
   ```
   *Because the index is partial (filtering for active statuses), cancelling a booking immediately frees up the table slot at the database engine level.*

### Status Lifecycle

```
pending → confirmed → completed
                   ↘ cancelled
```

- **Default State:** New reservations default to `confirmed`.
- **Admin Control:** Administrators can move any active reservation through the lifecycle states (`pending`, `confirmed`, `completed`, `cancelled`).
- **Terminal States:** `cancelled` and `completed` are terminal states — they cannot be modified or re-activated once reached.

### Table Snapshot (`tableSnapshot`)

When a reservation is created, a `tableSnapshot` object is automatically stored inside the reservation document:
```json
{ "tableNumber": 4, "capacity": 4 }
```
This ensures historical reservation records remain completely intact in both customer and admin dashboards even if the associated table is later deleted or modified in the database.

---

## 🔐 Role-Based Access Control (RBAC)

### Customer Capabilities (Role: `customer`)

| Capability | Access |
|---|---|
| Register / Login | ✅ |
| Browse Gourmet Menu, About Us & Contact Pages | ✅ |
| Toggle Light / Dark Theme | ✅ |
| Make a table reservation | ✅ |
| View own reservation history | ✅ |
| Cancel own reservation | ✅ |
| Use AI Booking Assistant | ✅ |
| View other users' reservations | ❌ |
| Manage / Create / Delete tables | ❌ |
| Access Admin Dashboard | ❌ |

### Administrator Capabilities (Role: `admin`)

| Capability | Access |
|---|---|
| Master Reservations Dashboard (View all bookings) | ✅ |
| Filter reservations by date | ✅ |
| Modify / Reschedule any reservation (date, time, table, guests) | ✅ |
| Cancel any user's reservation | ✅ |
| Add new restaurant tables | ✅ |
| Toggle table active/inactive status | ✅ |
| Delete restaurant tables | ✅ |
| Access Customer Dashboard | ❌ (Redirected to Admin Dashboard) |

### JWT Security Flow
- Login returns a JSON Web Token (JWT) signed with `JWT_SECRET`.
- Protected routes use a `protect` middleware verifying the Bearer token in the `Authorization` header.
- Admin routes use an `authorize('admin')` middleware that checks `req.user.role === 'admin'`.

---

## 🤖 Cozy AI Booking Assistant (Standout Feature)

An interactive conversational AI widget is mounted globally for authenticated users.

- **Natural Language Parsing:** Accepts prompts like *"Is there a table for 4 guests tomorrow at 7 PM?"* or *"Cancel my booking"*.
- **Google Gemini & Fallback NLP:** Uses direct REST requests to Google's Gemini models when `GEMINI_API_KEY` is provided, and automatically falls back to an internal regex-based NLP engine if omitted.
- **Contextual Slot-Filling:** Detects missing parameters (date, time, or guest count) and prompts the user for details before suggesting bookings.
- **Sync Event Dispatch:** Confirming a booking via AI automatically dispatches a `booking-updated` window event that silently refreshes both Customer and Admin UI grids.

---

## ⚠️ Known Limitations

1. **Render Cold Starts:** The free tier of Render sleeps after 15 minutes of inactivity. The initial request may take 30–50 seconds to spin up.
2. **Fixed Time Slots:** Bookings are limited to predefined 1-hour slots rather than flexible start times.
3. **Single Restaurant Location:** Designed for a single restaurant instance with fixed seating areas.
4. **No Real-Time Push (WebSockets):** Dashboard updates require page reloads or triggering sync events; live WebSocket broadcast is not implemented.

---

## 🔭 Areas for Improvement with Additional Time

1. **WebSockets Integration:** Use Socket.io to broadcast live reservation updates to all connected admin and customer screens instantly.
2. **Email/SMS Confirmation:** Integrate Nodemailer or Twilio for automated booking receipts and 24-hour reminder alerts.
3. **Interactive 2D/3D Floor Map:** Build a visual drag-and-drop floor map using Three.js / Canvas where guests can click specific tables.
4. **Waitlist Management:** Allow customers to join a waitlist when a slot is full, automatically notifying them if a cancellation occurs.
5. **Analytics & Occupancy Metrics:** Provide admin charts showing peak dining hours, occupancy rates, and table usage trends.

---

## 🏗️ Tech Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Lucide Icons, Vanilla CSS (Design System) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **AI Assistant** | Google Gemini REST API / Custom Local NLP Engine |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📋 API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new customer or admin user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT access token |
| `GET` | `/api/auth/me` | Auth | Get current authenticated user profile |
| `GET` | `/api/tables` | Auth | Retrieve all restaurant tables |
| `POST` | `/api/tables` | Admin | Create a new restaurant table |
| `PUT` | `/api/tables/:id` | Admin | Update table properties / toggle active status |
| `DELETE` | `/api/tables/:id` | Admin | Remove a table from the system |
| `GET` | `/api/reservations/availability` | Auth | Query available tables matching date, slot & guests |
| `GET` | `/api/reservations/me` | Customer | Get customer's personal reservation history |
| `GET` | `/api/reservations` | Admin | Master view of all reservations (optional date filter) |
| `POST` | `/api/reservations` | Customer | Create a new table reservation |
| `PUT` | `/api/reservations/:id/cancel` | Auth | Cancel a reservation (customer or admin) |
| `PUT` | `/api/reservations/:id` | Admin | Update / reschedule reservation details |
| `POST` | `/api/ai/chat` | Auth | Process conversational AI booking requests |
