require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../src/config/database');

async function migrate() {
  const files = fs.readdirSync(path.resolve(__dirname, '../migrations')).filter((file) => file.endsWith('.sql')).sort();
  await sequelize.authenticate();
  for (const file of files) {
    const sql = fs.readFileSync(path.resolve(__dirname, '../migrations', file), 'utf8');
    await sequelize.query(sql);
    console.log(`Applied ${file}`);
  }
  await sequelize.close();
}

migrate().catch((error) => { console.error('Migration failed:', error); process.exitCode = 1; });
