const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hamster_inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Player Schema
const playerSchema = new mongoose.Schema({
    username: String,
    full_name: String,
    telegram_id: String,
    auto_scores: { type: Number, default: 0 },
    tap_scores: { type: Number, default: 0 },
    boost_scores: { type: Number, default: 0 },
    referral_scores: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

const Player = mongoose.model('Player', playerSchema);

// Routes

// Get all players
app.get('/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
});

// Get individual player
app.get('/players/:id', async (req, res) => {
    try {
        const player = await Player.findOne({ telegram_id: req.params.id });
        if (player) {
            res.json(player);
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching player', error: error.message });
    }
});

app.get('/players/:id', async (req, res) => {
  console.log(`Fetching player with ID: ${req.params.id}`);
  try {
    const player = await Player.findOne({ telegram_id: req.params.id });
    console.log('Player found:', player);
    if (player) {
      res.json(player);
    } else {
      console.log('Player not found');
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Error fetching player', error: error.message });
  }
});

// Add new player
app.post('/players', async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(400).json({ message: 'Error adding player', error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});