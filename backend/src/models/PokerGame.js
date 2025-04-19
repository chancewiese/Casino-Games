// src/models/PokerGame.js
const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
  },
  chips: {
    type: Number,
    default: 1000,
    required: true,
  },
  hand: [String],
  bet: {
    type: Number,
    default: 0,
  },
  folded: {
    type: Boolean,
    default: false,
  },
  position: Number,
});

const PokerGameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  players: [PlayerSchema],
  maxPlayers: {
    type: Number,
    default: 6,
  },
  minBet: {
    type: Number,
    default: 10,
  },
  deck: [String],
  communityCards: [String],
  pot: {
    type: Number,
    default: 0,
  },
  currentTurn: {
    type: Number,
    default: 0,
  },
  gameState: {
    type: String,
    enum: ["waiting", "preflop", "flop", "turn", "river", "showdown", "ended"],
    default: "waiting",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const PokerGame = mongoose.model("PokerGame", PokerGameSchema);

module.exports = PokerGame;
