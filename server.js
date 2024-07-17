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
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const playerData = req.body;

    console.log('Received player data:', playerData);

    if (!playerData.id) {
      return res.status(400).json({ message: 'Player ID is required' });
    }

    const database = client.db(process.env.MONGODB_DB_NAME || 'test'); // Ensure you have the correct database name
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
    const database = client.db(process.env.MONGODB_DB_NAME || 'test'); // Ensure you have the correct database name
    const players = database.collection('players');

    const allPlayers = await players.find({}).toArray();
    console.log(`Found ${allPlayers.length} players`);
    res.status(200).json(allPlayers);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

app.get('/api/referrals/count/:playerId', async (req, res) => {
  try {
    const playerId = req.params.playerId;
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

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
