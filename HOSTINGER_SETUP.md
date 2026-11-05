# Hostinger backend setup

SICC Admin runs as a Node.js/Express application and stores data in a Hostinger MySQL database. Hostinger Node.js apps require a Business or Cloud hosting plan; confirm the exact plan and domain before deployment.

## Create the database

1. In hPanel, create a MySQL database and user (or use Hostinger's Node.js database setup).
2. Open that database in phpMyAdmin and import `server/schema.sql`.
3. Keep the database host, name, user, and password private. They belong only in the Node.js application's environment variables.

The schema creates an empty database with the application tables and default attendance programmes. The Leadership Training programme starts on the date the schema is imported; update its `start_date` in `attendance_programmes` if the training starts on a different date. It does not import Supabase data.

## Configure the Node.js application

Set these variables in the website's Node.js settings:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Set to `production` |
| `JWT_SECRET` | Random secret of at least 32 characters |
| `DB_HOST` | Hostinger database host |
| `DB_PORT` | Usually `3306` |
| `DB_NAME` | Full Hostinger database name |
| `DB_USER` | Full Hostinger database user |
| `DB_PASSWORD` | Database password |
| `INITIAL_ADMIN_NAME` | Name for the first admin |
| `INITIAL_ADMIN_EMAIL` | Email for the first admin |
| `INITIAL_ADMIN_PASSWORD` | Unique password, at least 12 characters |

Use the Hostinger-provided database credentials; do not put secrets in `REACT_APP_*` variables or commit a `.env` file. The initial admin is created only when the profiles table is empty. After the first successful startup, remove `INITIAL_ADMIN_PASSWORD` from the hosting environment.

## Deployment commands

Configure the Hostinger Node.js application to use the project root: the directory containing `package.json`, `package-lock.json`, `server/`, `src/`, `index.html`, and `vite.config.js`. Do not select the parent directory or the generated `build/` directory.

Set the deployment commands to:

| Setting | Command |
| --- | --- |
| Install command | `npm install --include=dev` |
| Build command | `npm run build` |
| Start command | `node server/index.js` |

The install command must include development dependencies because Vite and its React plugin are needed during the production build. The server serves the built React app and `/api` from the same origin. Do not deploy only the `build` folder, since that omits the API.

## Initial sign-in

Sign in with the initial admin email and password. Create other staff accounts through User Management. Since the new database starts empty, previous Supabase user accounts and passwords are not available.

## Local development

Import the same schema into a local MySQL database, copy `.env.example` to `.env`, and set the variables above. Run `npm start` for the API, then `npm run dev` in another terminal for the React development server.
