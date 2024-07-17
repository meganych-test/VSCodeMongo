const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let database;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    database = client.db(process.env.MONGODB_DB_NAME || 'test');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const playerData = req.body;

    console.log('Received player data:', playerData);

    if (!playerData.id) {
      return res.status(400).json({ message: 'Player ID is required' });
    }

    const players = database.collection('players');

    // Check if player already exists
    const existingPlayer = await players.findOne({ id: playerData.id });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Player already registered' });
    }

    // Insert new player
    const result = await players.insertOne(playerData);
    res.status(201).json({ message: 'Player registered successfully', playerId: result.insertedId });
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ message: 'Error registering player' });
  }
});

app.get('/api/players', async (req, res) => {
  console.log('Received request for /api/players');
  try {
    const players = database.collection('players');

    const allPlayers = await players.find({}).toArray();
    console.log(`Found ${allPlayers.length} players`);
    res.status(200).json(allPlayers);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

app.get('/api/players/:playerId', async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const players = database.collection('players');

    const player = await players.findOne({ id: playerId });
    if (player) {
      res.status(200).json(player);
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Error fetching player' });
  }
});

app.get('/api/referrals/count/:playerId', async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const players = database.collection('players');
    const count = await players.countDocuments({ referralId: playerId });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching referral count:', error);
    res.status(500).json({ message: 'Error fetching referral count' });
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`Received request for ${req.path}`);
  res.status(404).send('Not found');
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
