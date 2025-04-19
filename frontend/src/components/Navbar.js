// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  // Get player name from localStorage if available
  const playerName = localStorage.getItem("pokerPlayerName");

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Poker App
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/poker" className="nav-link">
              Play Poker
            </Link>
          </li>
          {playerName && (
            <li className="nav-item">
              <span className="nav-text">Playing as: {playerName}</span>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
