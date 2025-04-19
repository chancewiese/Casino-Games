// src/components/PlayingCard.js
import React from "react";
import "./PlayingCard.css";

const PlayingCard = ({ card }) => {
  if (!card) return null;

  // Parse the card string (e.g., "A_hearts")
  const [value, suit] = card.split("_");

  // Get card color based on suit
  const isRed = suit === "hearts" || suit === "diamonds";
  const cardColor = isRed ? "red" : "black";

  // Get suit symbol
  const getSuitSymbol = (suit) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  // Get face value display (A, K, Q, J, or number)
  const getDisplayValue = (value) => {
    switch (value) {
      case "A":
        return "A";
      case "K":
        return "K";
      case "Q":
        return "Q";
      case "J":
        return "J";
      default:
        return value;
    }
  };

  const suitSymbol = getSuitSymbol(suit);
  const displayValue = getDisplayValue(value);

  return (
    <div className={`playing-card ${cardColor}`}>
      <div className="card-value top-left">{displayValue}</div>
      <div className="card-suit top-left">{suitSymbol}</div>

      <div className="card-center-suit">{suitSymbol}</div>

      <div className="card-value bottom-right">{displayValue}</div>
      <div className="card-suit bottom-right">{suitSymbol}</div>
    </div>
  );
};

export default PlayingCard;
