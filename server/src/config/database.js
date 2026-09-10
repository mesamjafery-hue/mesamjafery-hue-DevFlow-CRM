const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cloud Postgres (Vercel Postgres / Neon / Supabase) provides a single
// DATABASE_URL connection string. Local development uses the DB_* variables.
const useUrl = Boolean(process.env.DATABASE_URL);

// Cloud providers require TLS; local Postgres usually does not.
// Set DB_SSL=false explicitly to disable it when using DATABASE_URL.
const useSsl = process.env.DB_SSL === 'true' || (useUrl && process.env.DB_SSL !== 'false');

const sequelize = new Sequelize(
  useUrl
    ? process.env.DATABASE_URL
    : process.env.DB_NAME,
  useUrl
    ? null
    : process.env.DB_USER,
  useUrl
    ? null
    : process.env.DB_PASSWORD,
  {
    ...(useUrl
      ? {}
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
        }),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    ...(useSsl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}),
    pool: {
      max: useUrl ? 3 : 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
