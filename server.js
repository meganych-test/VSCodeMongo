require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const Player = require('./models/Users');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://c1c0-213-111-76-158.ngrok-free.app'],
  credentials: true
}));
app.use(helmet());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy (necessary for secure cookies via ngrok)
app.set('trust proxy', 1);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/players-data', async (req, res) => {
  try {
    const htmlTemplate = await fs.readFile(path.join(__dirname, 'public', 'players-data.html'), 'utf-8');
    const players = await Player.find();
    const totalPlayers = await Player.countDocuments();
    const pointPool = process.env.INITIAL_POINT_POOL || 21000000;
    const poolNow = process.env.CURRENT_POINT_POOL || 19000000;

    // Generate table headers dynamically
    const schema = Player.schema.obj;
    const tableHeaders = Object.keys(schema)
      .map(field => `<th>${field}</th>`)
      .join('');

    // Generate table rows dynamically
    const tableRows = players.map(player => `
      <tr>
        ${Object.keys(schema).map(field => `<td>${player[field]}</td>`).join('')}
      </tr>
    `).join('');

    // Replace placeholders in the HTML template
    let dynamicHtml = htmlTemplate
      .replace('[INITIAL_POOL]', pointPool)
      .replace('[CURRENT_POOL]', poolNow)
      .replace('[TOTAL_PLAYERS]', totalPlayers)
      .replace('<!-- TABLE_HEADERS -->', tableHeaders)
      .replace('<!-- TABLE_ROWS -->', tableRows);

    res.send(dynamicHtml);
  } catch (error) {
    console.error('Error rendering players-data:', error);
    res.status(500).send('Error rendering players-data');
  }
});

app.get('/api/players-data', async (req, res) => {
  try {
    const players = await Player.find();
    const totalPlayers = await Player.countDocuments();
    const pointPool = process.env.INITIAL_POINT_POOL || 21000000;
    const poolNow = process.env.CURRENT_POINT_POOL || 19000000;

    res.json({ players, totalPlayers, pointPool, poolNow });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Error fetching players' });
  }
});

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Catch-all route for any unhandled routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
