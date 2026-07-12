# EateryEase - Restaurant Reservation System

A full-stack restaurant reservation management system built with React, Node.js, Express, and MongoDB.

## Features

- **Role-based Access Control**: Customers and Administrators have different views and capabilities.
- **Customer Dashboard**: Book tables, view reservation history, and cancel upcoming bookings.
- **Admin Dashboard**: View all reservations, filter by date, cancel reservations, and manage restaurant tables (capacity & table numbers).
- **Conflict Prevention**: System automatically checks table capacity and prevents double-booking for the same date and time slot.
- **Modern UI**: Designed with a responsive, glassmorphism-inspired interface.

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Lucide React (Icons), Vanilla CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcryptjs
- **Database**: MongoDB

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally (or a MongoDB URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the `.env` file exists with the following values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/restaurant_reservations
   JWT_SECRET=supersecretjwtkey123
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Using the System

### 1. Seeding Tables (Required for first run)
Before making reservations, you must seed tables into the database. You can do this by sending a POST request to:
`http://localhost:5000/api/tables/seed`
*(Or, register an Admin user and add tables manually from the Admin Dashboard).*

### 2. Creating an Admin User
By default, new users are registered as "customer". To create an admin:
1. Register a new user via the app.
2. Open your MongoDB shell or Compass.
3. Find the user in the `users` collection and update their role to `"admin"`.

## Assumptions Made
- The restaurant operates on fixed half-hour/hourly time slots (e.g., 18:00, 18:30).
- All tables are available for booking at any generated time slot.
- A user can only book a table if the table's capacity is greater than or equal to the number of guests.
- Once a table is booked for a specific time and date, it cannot be booked again until the reservation is cancelled.

## Reservation and Availability Logic
1. When a user requests a booking, the backend queries all tables where `capacity >= guests`.
2. It then iterates through these tables and checks the `reservations` collection for any conflicting booking (`status: 'confirmed'`) at the exact same `date` and `timeSlot`.
3. The first table found without a conflict is assigned to the user.
4. A MongoDB compound unique index `({ table: 1, date: 1, timeSlot: 1 })` ensures atomicity and prevents race conditions at the database level.

## Role-Based Access
- **Authentication**: JWT tokens are issued on login/registration and sent via the `Authorization` header on protected routes.
- **Frontend**: `ProtectedRoute` component checks the user's role stored in context. If a customer tries to access `/admin`, they are redirected, and vice versa.
- **Backend**: 
  - `protect` middleware verifies the JWT token.
  - `admin` middleware checks if `req.user.role === 'admin'` before allowing access to management routes (like getting all reservations or creating tables).

## Known Limitations
- The system checks for exact time slot conflicts, but does not calculate reservation duration (e.g., booking at 18:00 doesn't automatically block 18:30).
- Users currently have to be manually promoted to admin in the database.
- Missing password reset and email verification functionality.

## Areas for Improvement (With Additional Time)
- **Duration Handling**: Assume each reservation lasts 2 hours and block overlapping time slots accordingly.
- **Email Notifications**: Send booking confirmations and cancellation notices.
- **Pagination**: Implement pagination for the Admin's reservation view.
- **Visual Table Layout**: A graphical representation of the restaurant layout for admins to manage.
