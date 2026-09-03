require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const config = require('./config');

const PORT = config.port;

async function startServer() {
  try {
    console.log('Syncing database...');
    await sequelize.sync();
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
