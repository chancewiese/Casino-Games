// src/routes/games.js
const express = require("express");
const router = express.Router();
const PokerGame = require("../models/PokerGame");
const User = require("../models/User");

// Authentication middleware
const auth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to create a deck of cards
const createDeck = () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push(`${value}_${suit}`);
    }
  }

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Get all active poker games
router.get("/poker", auth, async (req, res) => {
  try {
    const games = await PokerGame.find({ gameState: "waiting" });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new poker game
router.post("/poker", auth, async (req, res) => {
  try {
    const { name, maxPlayers, minBet } = req.body;

    const newGame = new PokerGame({
      name,
      maxPlayers: maxPlayers || 6,
      minBet: minBet || 10,
      deck: createDeck(),
      players: [
        {
          userId: req.user._id,
          username: req.user.username,
          chips: req.user.chips,
          hand: [],
          position: 0,
        },
      ],
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Join a poker game
router.post("/poker/:id/join", auth, async (req, res) => {
  try {
    const game = await PokerGame.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.gameState !== "waiting") {
      return res.status(400).json({ message: "Game already started" });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ message: "Game is full" });
    }

    // Check if player is already in the game
    const existingPlayer = game.players.find(
      (player) => player.userId.toString() === req.user._id.toString()
    );

    if (existingPlayer) {
      return res.status(400).json({ message: "Already joined this game" });
    }

    // Add player to the game
    game.players.push({
      userId: req.user._id,
      username: req.user.username,
      chips: req.user.chips,
      hand: [],
      position: game.players.length,
    });

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a specific poker game
router.get("/poker/:id", auth, async (req, res) => {
  try {
    const game = await PokerGame.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if user is in the game
    const player = game.players.find(
      (player) => player.userId.toString() === req.user._id.toString()
    );

    if (!player && game.gameState !== "waiting") {
      return res
        .status(403)
        .json({ message: "Not authorized to view this game" });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Start a poker game
router.post("/poker/:id/start", auth, async (req, res) => {
  try {
    const game = await PokerGame.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if user is the creator (first player)
    if (game.players[0].userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the game creator can start the game" });
    }

    if (game.players.length < 2) {
      return res
        .status(400)
        .json({ message: "Need at least 2 players to start" });
    }

    if (game.gameState !== "waiting") {
      return res.status(400).json({ message: "Game already started" });
    }

    // Deal initial cards
    const updatedPlayers = [...game.players];
    const updatedDeck = [...game.deck];

    for (let i = 0; i < updatedPlayers.length; i++) {
      // Deal 2 cards to each player
      updatedPlayers[i].hand = [updatedDeck.pop(), updatedDeck.pop()];
    }

    game.players = updatedPlayers;
    game.deck = updatedDeck;
    game.gameState = "preflop";
    game.lastUpdated = Date.now();

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Place a bet
router.post("/poker/:id/bet", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const game = await PokerGame.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user._id.toString()
    );

    if (playerIndex === -1) {
      return res.status(403).json({ message: "Not a player in this game" });
    }

    if (game.currentTurn !== playerIndex) {
      return res.status(400).json({ message: "Not your turn" });
    }

    if (game.players[playerIndex].folded) {
      return res.status(400).json({ message: "You have folded" });
    }

    // Update player's bet and chips
    const betAmount = Math.min(
      parseInt(amount),
      game.players[playerIndex].chips
    );
    game.players[playerIndex].bet += betAmount;
    game.players[playerIndex].chips -= betAmount;
    game.pot += betAmount;

    // Move to next player
    let nextTurn = (playerIndex + 1) % game.players.length;
    while (game.players[nextTurn].folded && nextTurn !== playerIndex) {
      nextTurn = (nextTurn + 1) % game.players.length;
    }

    game.currentTurn = nextTurn;
    game.lastUpdated = Date.now();

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fold
router.post("/poker/:id/fold", auth, async (req, res) => {
  try {
    const game = await PokerGame.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      (player) => player.userId.toString() === req.user._id.toString()
    );

    if (playerIndex === -1) {
      return res.status(403).json({ message: "Not a player in this game" });
    }

    if (game.currentTurn !== playerIndex) {
      return res.status(400).json({ message: "Not your turn" });
    }

    // Player folds
    game.players[playerIndex].folded = true;

    // Move to next player
    let nextTurn = (playerIndex + 1) % game.players.length;
    while (game.players[nextTurn].folded && nextTurn !== playerIndex) {
      nextTurn = (nextTurn + 1) % game.players.length;
    }

    game.currentTurn = nextTurn;
    game.lastUpdated = Date.now();

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
