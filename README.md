# FixMate – Home Service Booking Platform

FixMate is a home service booking platform that connects customers with professional technicians. Customers can explore services, request repairs, track booking progress, and make secure online payments. Technicians can manage their services and handle customer requests, while administrators manage users, services, bookings, and transactions.

## Live Website

- **Frontend:** https://fix-mate-bice.vercel.app/
- **Backend API:** https://fixmate-server-i1bb.onrender.com
- **GitHub Repository:** https://github.com/ikhoanulislam/FixMate

## Demo Credentials

Use the following accounts to explore the platform:

| Role | Email | Password |
|---|---|---|
| Admin | ikhoanulislamtamim@gmail.com | 1234567890 |
| Technician | ikhoanulislam@gmail.com | 12345678 |
| Customer | guetcivilians@gmail.com | 123456123456 |

*These are demonstration credentials. Do not reuse these passwords for personal accounts.*

## Main Features

### Customer
- Browse and explore available home services.
- View service details.
- Submit service booking requests.
- Track booking status.
- View booking and payment history.
- Pay for completed services using Stripe.

### Technician
- Create, update, and manage services.
- View customer booking requests.
- Accept or reject service requests.
- Update job progress and completion status.
- Set the final service amount.

### Admin
- Manage users and user roles.
- Manage and approve services.
- Monitor all bookings.
- View payment transactions and revenue information.

### General
- Role-based dashboards and protected routes.
- Authentication with Better Auth.
- Secure online payment integration with Stripe.
- Responsive interface for mobile, tablet, and desktop.
- Booking status management.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Better Auth Mongo Adapter
- JSON Web Token (JWT)
- Stripe
- bcryptjs
- CORS
- dotenv

## Project Structure

```text
FixMate/
├── fixmate-client/       # Next.js frontend
│   ├── .env.local
│   └── package.json
│
├── fixmate-server/       # Express.js backend
│   ├── .env
│   └── package.json
│
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ikhoanulislam/FixMate.git
cd FixMate
```

### 2. Frontend Setup

```bash
cd fixmate-client
pnpm install
```

Create a `.env.local` file inside the `fixmate-client` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Replace the URL with your actual local backend API URL if your backend uses a different port.

Run the frontend:

```bash
pnpm dev
```

Frontend will run at:

```text
http://localhost:3000
```

### 3. Backend Setup

Open another terminal:

```bash
cd fixmate-server
pnpm install
```

Create a `.env` file inside the `fixmate-server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_CURRENCY=usd
```

Replace the example values with your own configuration.

Run the backend:

```bash
pnpm dev
```

## Environment Variables

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

### Backend

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Better Auth secret key |
| `BETTER_AUTH_URL` | Authentication application URL |
| `CLIENT_URL` | Frontend application URL |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_CURRENCY` | Payment currency |

**Security:** Never commit `.env`, `.env.local`, Stripe secret keys, database credentials, or authentication secrets to GitHub.

## Important Packages

### Frontend
- `next`
- `react`
- `react-dom`
- `better-auth`
- `tailwindcss`
- `typescript`

### Backend
- `express`
- `mongoose`
- `mongodb`
- `better-auth`
- `@better-auth/mongo-adapter`
- `jsonwebtoken`
- `bcryptjs`
- `stripe`
- `cors`
- `dotenv`
- `nodemon`

## Payment Integration

FixMate integrates Stripe Checkout for online service payments. Payments are intended to be made after a technician completes a booking and sets the final amount.

Stripe test mode can be used for testing payments.

## Developer

**Developed by:** IKHOANUL ISLAM  
**Project:** FixMate  
**Purpose:** Home Service Booking Platform

