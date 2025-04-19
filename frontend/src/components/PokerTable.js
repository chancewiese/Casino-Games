// src/components/PokerTable.js
import React from "react";
import "./PokerTable.css";
import PlayingCard from "./PlayingCard";

const PokerTable = ({ game, currentPlayerId }) => {
  // Find the current player
  const currentPlayer = game.players.find(
    (player) => player.userId === currentPlayerId
  );

  // Calculate positions around the table
  const getPlayerPosition = (position, totalPlayers) => {
    // For a circular table, calculate position percentages
    const angle = (position / totalPlayers) * 2 * Math.PI;
    const radius = 40; // % of container width

    const centerX = 50;
    const centerY = 50;

    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);

    return { x, y };
  };

  return (
    <div className="poker-table-container">
      <div className="poker-table">
        {/* Center area with community cards and pot */}
        <div className="table-center">
          {game.gameState !== "waiting" && (
            <>
              <div className="community-cards">
                {game.communityCards.map((card, index) => (
                  <PlayingCard key={index} card={card} />
                ))}
              </div>
              <div className="pot-display">
                <span className="pot-label">Pot:</span>
                <span className="pot-amount">{game.pot}</span>
              </div>
            </>
          )}
          {game.gameState === "waiting" && (
            <div className="waiting-text">Waiting for players...</div>
          )}
        </div>

        {/* Players around the table */}
        {game.players.map((player, index) => {
          const position = getPlayerPosition(index, game.maxPlayers);
          const isCurrentPlayer = player.userId === currentPlayerId;
          const isPlayerTurn =
            game.currentTurn === index && game.gameState !== "waiting";

          return (
            <div
              key={index}
              className={`player-position ${
                isCurrentPlayer ? "current-player" : ""
              } ${isPlayerTurn ? "active-player" : ""}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <div className="player-info">
                <div className="player-name">{player.username}</div>
                <div className="player-chips">{player.chips} chips</div>
                {player.bet > 0 && (
                  <div className="player-bet">Bet: {player.bet}</div>
                )}
                {player.folded && <div className="player-folded">Folded</div>}
              </div>

              {/* Player's cards */}
              <div className="player-cards">
                {isCurrentPlayer && player.hand && player.hand.length > 0
                  ? player.hand.map((card, cardIndex) => (
                      <PlayingCard key={cardIndex} card={card} />
                    ))
                  : player.hand && player.hand.length > 0
                  ? Array(player.hand.length)
                      .fill(0)
                      .map((_, cardIndex) => (
                        <div key={cardIndex} className="card-back"></div>
                      ))
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokerTable;
