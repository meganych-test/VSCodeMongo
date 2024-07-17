const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://meganych-test.github.io', 'https://hammongodb-fa6f3dfbc43b.herokuapp.com']
}));
app.use(bodyParser.json());

app.get('/api/players/:id', (req, res) => {
  const playerId = req.params.id;
  console.log(`Fetching data for player ID: ${playerId}`);

  // Add logic to fetch player data from the database
  // If player not found, send a 404 response
  // res.status(404).send({ error: "Player not found" });

  // For now, mock response
  res.json({
    id: playerId,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    language_code: "en",
    is_premium: false,
    photo_url: "https://example.com/photo.jpg",
    auth_date: "2024-07-16",
    chat_type: "private",
    chat_instance: "abcd1234",
    referralId: "ref1234"
  });
});

app.post('/api/register', (req, res) => {
  const playerData = req.body;
  console.log(`Registering player: ${JSON.stringify(playerData)}`);

  // Add logic to save player data to the database

  // For now, mock response
  res.status(201).send({ message: "Player registered successfully" });
});

app.get('/api/referrals/count/:playerId', (req, res) => {
  const playerId = req.params.playerId;
  console.log(`Fetching referral count for player ID: ${playerId}`);

  // Add logic to fetch referral count from the database

  // For now, mock response
  res.json({ count: 10 });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
