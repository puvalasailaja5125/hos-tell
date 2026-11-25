# Hos-Tell: Smart PG / Hostel & Mess Manager

A full-stack web app that helps PG and hostel owners and their residents manage **rent, meals, maintenance requests and leave** in one place, replacing paper registers and WhatsApp messages.

**Live demo:** [https://YOUR-LIVE-ADDRESS.vercel.app](https://hos-tell.vercel.app/)
**Source code:** https://github.com/puvalasailaja5125/hos-tell

> Rent is tracked inside the app (bills, paid and pending status, history). Online payment is not included.

## Demo

https://youtu.be/R6-xcZEX4No

## Features

### For tenants
- **Dashboard** with room, monthly rent, rent due banner, tomorrow's meals and recent tickets
- **Rent:** see every monthly bill, its status (pending or paid) and the date it was paid
- **Meals:** all meals (breakfast, lunch, snacks, dinner) are on by default. Skip any meal for the coming days until 10 PM the night before, so the kitchen cooks less food that gets wasted
- **Maintenance tickets:** report a problem and follow it from Open to In progress to Resolved
- **Leave requests:** apply in advance with a from date, a to date (they can be the same day) and a reason. See the result in the app: a friendly approval message, or the owner's reason for rejecting

### For the owner (admin)
- **Overview dashboard:** attention banner, tenant and room counts, this month's rent collected versus pending, tomorrow's kitchen headcount, and the latest pending leave requests and open tickets
- **Tenants:** assign each tenant to a room
- **Rent:** generate a month's bills for every tenant with one click (safe to click twice), mark bills paid or unpaid, and see totals
- **Meals:** headcount per meal for any date, with a per-tenant breakdown. Residents on approved leave are excluded automatically
- **Tickets:** filter by status and update progress
- **Leave requests:** see the tenant's pending rent dues next to each request, then approve or reject. Rejecting requires a reason, and a standard "clear your dues first" message is suggested when the tenant has unpaid rent

### For everyone
- Marketing landing page with an offers carousel, filterable facilities, a weekly mess menu, FAQ and a mobile menu
- Registration, login and logout
- **Forgot password by email** with a one-time link that expires in 30 minutes
- Fully responsive layout, with loading, error and 404 pages

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router), React |
| Styling and UI | Tailwind CSS, shadcn/ui, Lucide icons |
| Database | PostgreSQL on Neon |
| ORM | Prisma 6 |
| Auth | bcryptjs for password hashing, JWT (jose) in an httpOnly cookie |
| Email | Nodemailer with an SMTP provider (Gmail) |
| Hosting | Vercel |

## How it is built

- **Role-based access control (Admin and Tenant).** The role is stored in the database and signed into the session cookie. Users never choose their role: registration always creates a tenant, and admins are created only by the seed script.
- **Two layers of protection.** Pages redirect the wrong role away, and every API route independently checks the role and returns `401` or `403`, since the API is what really matters for security.
- **Server-side validation.** Dates, lengths, statuses and ownership are checked on the server. For example, tenants can only read and change their own rent, meals, tickets and leave, because the user id always comes from the signed cookie and never from the request.
- **Safe password reset.** Reset tokens are random, only a hash of the token is stored, each link is single-use, expires after 30 minutes, and the forgot-password endpoint answers the same way whether or not the email exists.
- **Time zone safe dates.** Days are handled as plain `YYYY-MM-DD` strings in Indian time, so meals and leave never shift to the wrong day on a server running in UTC.
- **Idempotent billing.** A unique constraint on tenant and month, combined with `skipDuplicates`, means generating bills twice never creates duplicates.
- **Meal opt-out model.** Only explicit choices are stored. No row means the tenant is eating, which keeps the data small and the headcount simple.

## Data model

`User` (role: ADMIN or TENANT) belongs to a `Room`. A user has many `RentPayment`, `MealOptIn`, `Ticket`, `LeaveRequest` and `PasswordResetToken` records.

## Getting started

### Prerequisites
- Node.js 20.6 or newer
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)
- Optional: a Gmail account with an app password, for password reset emails. Without SMTP settings, reset links are printed in the terminal instead.

### Setup

```bash
git clone https://github.com/YOUR-USERNAME/hos-tell.git
cd hos-tell
npm install
```

Create a `.env` file in the project root (see the table below), then:

```bash
# create the tables
npx prisma migrate dev

# create sample rooms and the admin account
node --env-file=.env prisma/seed.js

# start the app at http://localhost:3000
npm run dev
```

Log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set, then use **Forgot password** to choose your own password.

### Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Database connection string used by the app (use Neon's pooled string in production) |
| `DIRECT_URL` | Direct (non-pooled) connection string used by Prisma migrations |
| `JWT_SECRET` | Long random string used to sign login cookies |
| `APP_URL` | Public address of the app, used to build password reset links (`http://localhost:3000` locally) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email server settings. Leave out to print reset links in the terminal instead |
| `MAIL_FROM` | Sender shown on emails, for example `Hos-Tell <you@gmail.com>` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the seed script to create the first admin |

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit your `.env` file.

## Deployment

The app is deployed on Vercel with a Neon database.

1. Push the repository to GitHub and import it into Vercel.
2. Add the environment variables above in the Vercel project settings (not `ADMIN_EMAIL` or `ADMIN_PASSWORD`). Set `DATABASE_URL` to the pooled connection string and `DIRECT_URL` to the direct one.
3. Set `APP_URL` to the deployed address and redeploy.
4. When the schema changes, apply migrations to the live database with `npx prisma migrate deploy`.

A `postinstall` script runs `prisma generate` so the Prisma client is always up to date on every build.

## Known limitations and ideas

- Resetting a password does not sign out devices that are already logged in, because sessions are stateless. A token version stored on the user would fix this.
- The free database sleeps when idle, so the first request after a quiet period can be slow.
- Possible extensions: online rent payment, notifications for leave decisions and new tickets, support for multiple PGs under one owner, and downloadable rent receipts.

## Author

Built by **Sailaja**, a computer science and engineering student, as a full-stack project using Next.js, Prisma and PostgreSQL.
