# Database migrations

The development server uses `sequelize.sync()` to create missing tables. Production deployments should use reviewed migrations instead of syncing schemas automatically.

Before deployment:

1. Export a PostgreSQL backup.
2. Generate a Sequelize migration for each model change.
3. Apply migrations in order during deployment.
4. Run `npm run seed` only against a new development database; it truncates existing tables.

The current schema additions are `contacts`, `prospects`, `activities`, `milestones`, `documents`, `ticket_messages`, `payments`, `quotations`, and `role_permissions`.
