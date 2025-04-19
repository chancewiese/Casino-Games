// src/pages/PokerRoom.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import PokerTable from "../components/PokerTable";
import PokerControls from "../components/PokerControls";
import "./PokerRoom.css";

const PokerRoom = ({ user }) => {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join the game room when socket is available
  useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", "poker-game");

      // Listen for game updates
      socket.on("pokerUpdate", (updatedGame) => {
        setGame(updatedGame);
      });
    }
  }, [socket]);

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get("/games/poker");
        setGame(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching game:", error);
        setError("Failed to load game");
        setLoading(false);
      }
    };

    fetchGame();
  }, []);

  // Join the game
  const handleJoinGame = async () => {
    try {
      const response = await axios.post("/games/poker/join");
      setGame(response.data);
      // Emit event to update other players
      if (socket) {
        socket.emit("pokerAction", {
          roomId: "poker-game",
          game: response.data,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to join game");
    }
  };

  // Start the game
  const handleStartGame = async () => {
    try {
      const response = await axios.post("/games/poker/start");
      setGame(response.data);
      // Emit event to update other players
      if (socket) {
        socket.emit("pokerAction", {
          roomId: "poker-game",
          game: response.data,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to start game");
    }
  };

  // Reset the game
  const handleResetGame = async () => {
    try {
      const response = await axios.post("/games/poker/reset");
      setGame(response.data);
      // Emit event to update other players
      if (socket) {
        socket.emit("pokerAction", {
          roomId: "poker-game",
          game: response.data,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset game");
    }
  };

  // Place a bet
  const handleBet = async (amount) => {
    try {
      const response = await axios.post("/games/poker/bet", { amount });
      setGame(response.data);
      // Emit event to update other players
      if (socket) {
        socket.emit("pokerAction", {
          roomId: "poker-game",
          game: response.data,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place bet");
    }
  };

  // Fold
  const handleFold = async () => {
    try {
      const response = await axios.post("/games/poker/fold");
      setGame(response.data);
      // Emit event to update other players
      if (socket) {
        socket.emit("pokerAction", {
          roomId: "poker-game",
          game: response.data,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fold");
    }
  };

  // Go back to home
  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="error-container">
        <h2>Game not found</h2>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    );
  }

  // Check if current user is in the game
  const currentPlayer = game.players.find(
    (player) => player.userId === user.id
  );

  // Determine if current user is the creator (first player)
  const isFirstPlayer =
    game.players.length > 0 && game.players[0].userId === user.id;

  // Check if it's current player's turn
  const isPlayerTurn =
    game.gameState !== "waiting" &&
    game.players[game.currentTurn] &&
    game.players[game.currentTurn].userId === user.id;

  return (
    <div className="poker-room">
      <div className="poker-header">
        <h1>Poker Game</h1>
        <div className="poker-info">
          <p>
            Status:{" "}
            {game.gameState === "waiting"
              ? "Waiting for players"
              : game.gameState}
          </p>
          <p>
            Players: {game.players.length}/{game.maxPlayers}
          </p>
          {game.gameState !== "waiting" && <p>Pot: {game.pot} chips</p>}
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Leave Game
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="poker-content">
        {/* Game table */}
        <PokerTable game={game} currentPlayerId={user.id} />

        {/* Game controls */}
        <div className="poker-action-area">
          {!currentPlayer ? (
            <button className="btn btn-primary btn-lg" onClick={handleJoinGame}>
              Join Game
            </button>
          ) : game.gameState === "waiting" ? (
            <div className="game-start-controls">
              <button
                className="btn btn-success btn-lg"
                onClick={handleStartGame}
                disabled={game.players.length < 2}
              >
                Start Game
                {game.players.length < 2 && " (Need at least 2 players)"}
              </button>
            </div>
          ) : game.gameState !== "waiting" && isPlayerTurn ? (
            <PokerControls
              onBet={handleBet}
              onFold={handleFold}
              minBet={game.minBet}
              playerChips={currentPlayer.chips}
            />
          ) : (
            <p className="waiting-message">
              {game.gameState === "waiting"
                ? "Waiting for the game to start..."
                : "Waiting for your turn..."}
            </p>
          )}

          {/* Reset game button (visible to all players when game is not in 'waiting' state) */}
          {currentPlayer && game.gameState !== "waiting" && (
            <button
              className="btn btn-warning"
              onClick={handleResetGame}
              style={{ marginTop: "1rem" }}
            >
              Reset Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerRoom;
