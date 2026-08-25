# Collab Doc

A lightweight collaborative document editor (Next.js + Prisma/Postgres + TipTap).

> Work in progress — being built phase by phase. This README will be filled in
> (setup, seeded accounts, supported upload types, limitations) in the quality
> pass phase.

## Local setup (current state)

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL with your Postgres connection string
npm run db:migrate     # creates tables
npm run db:seed        # seeds Alice, Bob, Carol
npm run dev
```

Visit `http://localhost:3000` and `http://localhost:3000/api/health` to confirm
the app is running and connected to the database.
