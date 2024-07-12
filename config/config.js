// config/config.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  initialPoolSize: parseInt(process.env.INITIAL_POINT_POOL, 10),
  mongoURI: process.env.MONGODB_URI
};

if (isNaN(config.initialPoolSize)) {
  console.error('Invalid INITIAL_POINT_POOL value in .env file');
  process.exit(1);
}

module.exports = config;
