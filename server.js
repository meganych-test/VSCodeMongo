process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

if (!uri) {
  console.error('MONGODB_URI is not set. Please set this environment variable.');
  process.exit(1);
}

console.log('MongoDB URI:', uri.replace(/:[^:]*@/, ':****@')); // Log the URI with password hidden

const client = new MongoClient(uri, {
  ssl: true,
  tls: true,
  tlsInsecure: false
});

let database;
let playersCollection;

async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));
    console.log('Database Name:', process.env.MONGODB_DB_NAME);
    await client.connect();
    console.log('Connected to MongoDB');
    database = client.db(process.env.MONGODB_DB_NAME || 'ProjectH');
    playersCollection = database.collection('PlayersData');
    console.log('Database and collection set up successfully');
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
    const existingPlayer = await playersCollection.findOne({ id: playerData.id });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Player already registered' });
    }
    const result = await playersCollection.insertOne(playerData);
    res.status(201).json({ message: 'Player registered successfully', playerId: result.insertedId });
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ message: 'Error registering player' });
  }
});

app.get('/api/players', async (req, res) => {
  console.log('Received request for /api/players');
  try {
    const allPlayers = await playersCollection.find({}).toArray();
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
    console.log(`Received request for player with ID: ${playerId}`);
    const player = await playersCollection.findOne({ id: playerId });
    if (player) {
      console.log(`Found player: ${JSON.stringify(player)}`);
      res.status(200).json(player);
    } else {
      console.log(`Player not found with ID: ${playerId}`);
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
    console.log(`Received request for referral count of player with ID: ${playerId}`);
    const count = await playersCollection.countDocuments({ referralId: playerId });
    console.log(`Referral count for player ${playerId}: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching referral count:', error);
    res.status(500).json({ message: 'Error fetching referral count' });
  }
});

app.get('/', (req, res) => {
  console.log('Received request for root path');
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
    // Instead of exiting, we'll keep the process running to see the error in the logs
    // process.exit(1);
  }
}

startServer();
