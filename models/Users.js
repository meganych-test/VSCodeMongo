const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    fullName: String,
    userName: String,
    telegramId: String,
    createdAt: { type: Date, default: Date.now },
    referredBy: String,
    referralCount: { type: Number, default: 0 },
    web3Wallet: String,
    tapGameBalance: { type: Number, default: 0 },
    tapGameLevel: { type: Number, default: 0 },
    autoGameBalance: { type: Number, default: 0 },
    autoPointsLevel: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    referralsLevel: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 },
    web3WithdrawalsRequests: { type: Number, default: 0 },
    tapGameClicks: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' }
});

module.exports = mongoose.model('Player', playerSchema);