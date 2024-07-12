// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const Player = require('../models/Users');

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

// Add a new player
router.post('/', async (req, res) => {
  const { username, full_name, telegram_id, referral } = req.body;
  const newPlayer = new Player({ username, full_name, telegram_id, referral });
  try {
    await newPlayer.save();
    if (referral) {
      const referringPlayer = await Player.findOne({ username: referral });
      if (referringPlayer) {
        referringPlayer.referral_count = (referringPlayer.referral_count || 0) + 1;
        await referringPlayer.save();
      }
    }
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ message: 'Error adding player' });
  }
});

module.exports = router;
