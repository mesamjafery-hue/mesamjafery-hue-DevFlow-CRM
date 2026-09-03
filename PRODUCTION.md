# Production checklist

- Copy `server/.env.example` to a protected production environment and replace every placeholder.
- Use long random JWT secrets and `NODE_ENV=production`.
- Run PostgreSQL with a least-privilege application user.
- Put the API behind HTTPS and a reverse proxy.
- Restrict `CLIENT_URL` to the deployed frontend origin.
- Store uploads outside the public web root and serve them through authenticated download routes.
- Use reviewed Sequelize migrations before starting the application.
- Configure SMTP credentials for verification and reset emails.
- Never run the seed script against production data.
