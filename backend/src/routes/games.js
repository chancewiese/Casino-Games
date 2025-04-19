// src/routes/games.js
const express = require("express");
const router = express.Router();
const PokerGame = require("../models/PokerGame");

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

// Get the current poker game (or create it if it doesn't exist)
router.get("/poker", async (req, res) => {
  try {
    // Try to find the existing game
    let game = await PokerGame.findOne();

    // If no game exists, create a new one
    if (!game) {
      game = new PokerGame({
        name: "Poker Game",
        maxPlayers: 6,
        minBet: 10,
        deck: createDeck(),
        players: [],
      });
      await game.save();
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Join the poker game
router.post("/poker/join", async (req, res) => {
  try {
    const { playerName } = req.body;

    if (!playerName || playerName.trim() === "") {
      return res.status(400).json({ message: "Player name is required" });
    }

    // Find the game (there should only be one)
    let game = await PokerGame.findOne();

    if (!game) {
      // Create a new game if none exists
      game = new PokerGame({
        name: "Poker Game",
        maxPlayers: 6,
        minBet: 10,
        deck: createDeck(),
        players: [],
      });
    }

    // Check if game is full
    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ message: "Game is full" });
    }

    // Check if player name is already in the game
    const existingPlayer = game.players.find(
      (player) => player.playerName === playerName
    );

    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: "Name already taken, please choose another" });
    }

    // Add player to the game
    game.players.push({
      playerName: playerName,
      chips: 1000,
      hand: [],
      position: game.players.length,
    });

    await game.save();
    res.json(game);
  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Start the poker game
router.post("/poker/start", async (req, res) => {
  try {
    const { playerName } = req.body;

    // Find the game
    const game = await PokerGame.findOne();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
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
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset the game
router.post("/poker/reset", async (req, res) => {
  try {
    // Find the game
    let game = await PokerGame.findOne();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Keep the same players but reset their hands, bets, etc.
    const updatedPlayers = game.players.map((player) => ({
      ...player,
      hand: [],
      bet: 0,
      folded: false,
    }));

    // Reset the game state
    game.players = updatedPlayers;
    game.deck = createDeck();
    game.communityCards = [];
    game.pot = 0;
    game.currentTurn = 0;
    game.gameState = "waiting";
    game.lastUpdated = Date.now();

    await game.save();
    res.json(game);
  } catch (error) {
    console.error("Error resetting game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Place a bet
router.post("/poker/bet", async (req, res) => {
  try {
    const { amount, playerName } = req.body;
    const game = await PokerGame.findOne();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      (player) => player.playerName === playerName
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
    console.error("Error placing bet:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fold
router.post("/poker/fold", async (req, res) => {
  try {
    const { playerName } = req.body;
    const game = await PokerGame.findOne();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      (player) => player.playerName === playerName
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
    console.error("Error folding:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
