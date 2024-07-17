const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['https://meganych-test.github.io', 'https://hammongodb-fa6f3dfbc43b.herokuapp.com']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set. Please set this environment variable.');
  process.exit(1);
}

console.log('MongoDB URI:', uri.replace(/:[^:]*@/, ':****@')); // Log the URI with password hidden

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true
});

let database;
let playersCollection;

async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
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

app.get('/', (req, res) => {
  res.send('Server is running');
});

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
    console.log(`Fetching player with ID: ${playerId}`);
    const player = await playersCollection.findOne({ id: playerId });
    if (player) {
      console.log(`Player found:`, player);
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
    console.log(`Fetching referral count for player ID: ${playerId}`);
    const count = await playersCollection.countDocuments({ referralId: playerId });
    console.log(`Referral count for player ${playerId}: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching referral count:', error);
    res.status(500).json({ message: 'Error fetching referral count' });
  }
});

app.get('/api/telegram/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    console.error('BOT_TOKEN is not set. Please set this environment variable.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    let userData;
    if (userId.includes('-test-')) {
      // This is a test user, return mock data
      userData = {
        id: userId,
        first_name: "Test",
        last_name: "User",
        username: "testuser"
      };
    } else {
      // This is a real Telegram user, fetch data from Telegram API
      const url = `https://api.telegram.org/bot${botToken}/getChat`;
      const response = await axios.get(url, { params: { chat_id: userId } });
      userData = response.data.result;
    }
    console.log(`User data for ${userId}:`, userData);
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    setTimeout(startServer, 5000); // Retry after 5 seconds
  }
}

startServer();
