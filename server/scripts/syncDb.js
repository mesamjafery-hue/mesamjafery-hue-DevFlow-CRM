require('dotenv').config();
const sequelize = require('../src/config/database');

// One-off helper: creates the full schema (all model tables) on the
// database configured in .env — local Postgres or a cloud DATABASE_URL.
// Usage:  npm run db:push   (add demo data afterwards with: npm run seed)
async function main() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected. Syncing schema...');
    await sequelize.sync();
    console.log('Schema synced successfully — all tables are up to date.');
    await sequelize.close();
  } catch (error) {
    console.error('Schema sync failed:', error.message);
    process.exit(1);
  }
}

main();