// src/components/PokerControls.js
import React, { useState } from "react";
import "./PokerControls.css";

const PokerControls = ({ onBet, onFold, minBet, playerChips }) => {
  const [betAmount, setBetAmount] = useState(minBet);

  const handleBetChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= minBet && value <= playerChips) {
      setBetAmount(value);
    }
  };

  const handleBet = () => {
    onBet(betAmount);
  };

  return (
    <div className="poker-controls">
      <div className="controls-info">
        <div className="info-item">
          <span className="info-label">Min Bet:</span>
          <span className="info-value">{minBet}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Your Chips:</span>
          <span className="info-value">{playerChips}</span>
        </div>
      </div>

      <div className="bet-controls">
        <div className="bet-amount-container">
          <label htmlFor="bet-amount">Bet Amount:</label>
          <input
            type="range"
            id="bet-amount"
            min={minBet}
            max={playerChips}
            value={betAmount}
            onChange={handleBetChange}
            className="bet-slider"
          />
          <div className="bet-value">{betAmount}</div>
        </div>

        <div className="bet-buttons">
          <button
            className="btn-bet btn-check"
            onClick={() => onBet(0)}
            disabled={playerChips < minBet}
          >
            Check
          </button>

          <button
            className="btn-bet btn-call"
            onClick={() => onBet(minBet)}
            disabled={playerChips < minBet}
          >
            Call ({minBet})
          </button>

          <button
            className="btn-bet btn-raise"
            onClick={handleBet}
            disabled={playerChips < minBet}
          >
            Raise ({betAmount})
          </button>

          <button className="btn-bet btn-fold" onClick={onFold}>
            Fold
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerControls;
