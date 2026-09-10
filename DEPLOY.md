# Deploying DevFlow-CRM to Vercel (full app + PostgreSQL)

The stack: **React (client/) + Express (server/) + PostgreSQL**. Vercel hosts the
frontend as a static site and the backend as serverless functions; the database
must be a **cloud** Postgres, because Vercel cannot reach a Postgres running on
your own machine (pgAdmin/local install is fine for development only).

> Your local database stays exactly as it is — these steps create a separate
> cloud copy for the live app.

---

## Step 1 — Create the cloud database (once)

1. Open <https://vercel.com/dashboard> → your project's team → **Storage** tab → **Create Database** → **Postgres (Neon)** → Free tier → name it e.g. `devflow-crm`.
2. When created, open the database → **.env.local** tab. You need the single
   connection string: `DATABASE_URL` (looks like
   `postgresql://user:pass@ep-xxx...neon.tech/neondb?sslmode=require`).

## Step 2 — Copy your schema to the cloud database (once, from your PC)

In `server/`, create/edit `server/.env` and add the cloud `DATABASE_URL` from
step 1 (leave the existing `DB_*` values — they are ignored while
`DATABASE_URL` is present):

```env
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
```

Then run:

```bash
cd server
npm install
npm run db:push     # creates every table from the Sequelize models
npm run seed        # OPTIONAL: demo users/data (admin@devflow.com / Password@123)
```

Remove or comment out `DATABASE_URL` from `server/.env` afterwards so local
development keeps using your local Postgres.

## Step 3 — Deploy the backend (API)

1. Vercel dashboard → **Add New… → Project** → import your GitHub repo
   (`mesamjafery-hue/DevFlow-CRM`).
2. Set **Root Directory** to `server` (Vercel detects the `api/` folder automatically).
3. Under **Environment Variables**, add (Production + Preview):

   | Variable            | Value                                                              |
   | ------------------- | ------------------------------------------------------------------ |
   | `DATABASE_URL`      | the Neon connection string from Step 1                             |
   | `JWT_ACCESS_SECRET` | any long random string (32+ chars)                                 |
   | `JWT_REFRESH_SECRET`| another long random string                                         |
   | `CLIENT_URL`        | *(add after Step 4, once you know the frontend URL)*               |
   | `UPLOAD_DIR`        | `/tmp/uploads`                                                     |
   | `SMTP_HOST/PORT/USER/PASS/FROM` | *(optional, only if you need emails)*                  |
   | `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL` | *(optional)*                                  |

4. Click **Deploy**. Note the URL, e.g. `https://devflow-crm-api.vercel.app` —
   health check: `https://<api-url>/api/v1/health`.

## Step 4 — Deploy the frontend

1. Vercel dashboard → **Add New… → Project** → import the **same repo** again.
2. Set **Root Directory** to `client` (framework auto-detects as **Vite**).
3. Under **Environment Variables** add:

   | Variable       | Value                                              |
   | -------------- | -------------------------------------------------- |
   | `VITE_API_URL` | `https://<api-url-from-step-3>/api/v1`             |

4. Click **Deploy**. Note the URL, e.g. `https://devflow-crm.vercel.app`.
5. Go back to the **backend** project → Settings → Environment Variables → set
   `CLIENT_URL` to `https://<frontend-url>` (this is what CORS allows) →
   **Redeploy** the backend.

## Step 5 — Use it

Open the frontend URL and log in with `admin@devflow.com` / `Password@123`
(if you ran the seed) or your real users from the cloud database.

---

## How updates work

Every `git push` to `main` auto-redeploys both projects. Changing `VITE_API_URL`
or backend env vars requires a redeploy (dashboard → Deployments → Redeploy).

## Local development (unchanged)

- `server/.env` keeps `DB_HOST=localhost` etc. → uses your local Postgres.
- `client/.env` can set `VITE_API_URL=http://localhost:5000/api/v1` (this is the
  default when the variable is missing).

## Known limitations on Vercel

- **File uploads** are stored in `/tmp/uploads` and are **not persistent**
  across serverless invocations — use an object store (S3/Cloudinary) for real
  production uploads.
- Cold starts may add ~1s to the first request.
- Free-tier Neon databases pause after inactivity; the first request wakes them.
