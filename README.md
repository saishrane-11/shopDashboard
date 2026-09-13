# Shop Book

A simple digital sales book for small shopkeepers. It replaces the notebook used for daily sales: add products, record a sale in a few seconds, keep stock in sync, and review today's numbers.

This is not an ERP, POS suite, or accounting tool. V1 is limited to the shopkeeper notebook workflow.

## Features

- Shop registration and login
- Product catalog with price and stock
- Fast new-sale flow on mobile
- Automatic totals and inventory updates
- Sales history, sale details, and cancellation with stock restore
- Dashboard, low-stock view, and basic reports
- Shop settings and password change
- Multi-tenant isolation: one shop never sees another shop's data

## Tech stack

- **Frontend:** React, Vite, TypeScript, React Router
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL + Prisma
- **Auth:** HTTP-only cookie + JWT, bcrypt password hashing

## Architecture

```text
client/          React SPA (mobile-first)
server/          REST API
  src/controllers
  src/services   business logic and transactions
  src/routes
  src/middleware auth, errors
  prisma/        schema, seed
```

Tenant identity (`shopId`) always comes from the authenticated session cookie. The API never trusts a `shopId` from the client.

Completing or cancelling a sale runs inside a PostgreSQL transaction so stock and sale rows stay consistent.

Historical sale prices are stored on `SaleItem.unitPrice`. Later product price changes do not rewrite old sales.

## Database schema

- **User** — owner account
- **Shop** — one shop per owner in V1
- **Product** — current price and stock, scoped by `shopId`
- **Sale** — completed or cancelled transaction
- **SaleItem** — quantity and price snapshot at sale time

## Environment variables

Copy `.env.example` to `server/.env`:

```env
DATABASE_URL="postgresql://shopbook:shopbook@localhost:5432/shopbook"
JWT_SECRET="replace-with-a-long-random-secret"
NODE_ENV="development"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
COOKIE_NAME="shopbook_token"
TZ="Asia/Kolkata"
```

Never commit real secrets.

## Installation

1. Install [Node.js 20+](https://nodejs.org/) and [Docker](https://www.docker.com/) (or a local PostgreSQL 16).
2. From the project root:

```bash
docker compose up -d
cd server
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
cd ../client
npm install
```

On macOS/Linux use `cp .env.example .env` instead of `copy`.

## Database migration

```bash
cd server
npx prisma migrate dev
```

## Seed

```bash
cd server
npm run prisma:seed
```

Demo login:

- Phone: `9999999999`
- Email: `demo@shopbook.dev`
- Password: `demo1234`

## Development

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to http://localhost:4000.

## Tests

```bash
cd server
npm test
```

Tests cover registration, login, product CRUD, sale totals, stock movement, price snapshots, cancellation, report exclusion of cancelled sales, and cross-shop isolation.

## Production build

```bash
cd client
npm run build

cd ../server
npm run build
NODE_ENV=production npm start
```

Serve the client `dist/` folder from any static host, and point `CLIENT_ORIGIN` at that origin. Set `Secure` cookies by using HTTPS and `NODE_ENV=production`.

## API overview

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/logout` | No |
| GET | `/api/auth/me` | Yes |
| PATCH | `/api/auth/password` | Yes |
| GET/POST | `/api/products` | Yes |
| GET/PATCH/DELETE | `/api/products/:id` | Yes |
| GET/POST | `/api/sales` | Yes |
| GET | `/api/sales/:id` | Yes |
| POST | `/api/sales/:id/cancel` | Yes |
| GET | `/api/dashboard` | Yes |
| GET | `/api/reports/sales` | Yes |
| GET | `/api/reports/top-products` | Yes |
| GET/PATCH | `/api/shop` | Yes |

All authenticated queries are scoped to the shop on the session cookie.
