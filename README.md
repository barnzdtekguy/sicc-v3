# SICC Admin

Internal administrative portal for Salem International Christian Centre. The frontend is React; authentication and data access are served by an Express API backed by MySQL.

## Local setup

1. Install Node.js 20 or newer and MySQL.
2. Create a database and import [`server/schema.sql`](./server/schema.sql).
3. Copy `.env.example` to `.env` and set your database credentials, a random `JWT_SECRET` of at least 32 characters, and the initial admin name, email, and password. The initial password must be at least 12 characters.
4. Run `npm install --include=dev`, `npm run build`, and `npm start`.

The first server start creates the initial administrator only when the profiles table is empty. Set the initial admin environment variables before that first start.

For frontend development, run the API with `npm start` on port 3001 and run `npm run dev` in a second terminal. The React development server proxies API requests to the local API.

## Hostinger

See [HOSTINGER_SETUP.md](./HOSTINGER_SETUP.md) for MySQL, Node.js, environment-variable, and deployment setup. The current backend uses a fresh database; Supabase records and passwords are not migrated.
