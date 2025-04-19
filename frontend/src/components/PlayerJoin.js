// src/components/PlayerJoin.js
import React, { useState } from "react";
import "./PlayerJoin.css";

const PlayerJoin = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError("Please enter your name to join the game");
      return;
    }

    onJoin(playerName);
  };

  return (
    <div className="player-join">
      <div className="player-join-card">
        <h2>Join Poker Game</h2>
        {error && <div className="join-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playerName">Enter Your Name</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              required
            />
          </div>
          <button type="submit" className="join-button">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerJoin;
