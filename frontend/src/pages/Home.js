// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = ({ user }) => {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>Welcome to Casino App</h1>
        <p>The ultimate poker experience!</p>
        {!user ? (
          <div className="home-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        ) : (
          <div className="home-user-actions">
            <h2>Ready to play?</h2>
            <Link to="/poker" className="btn btn-primary btn-lg">
              Play Poker
            </Link>
          </div>
        )}
      </div>

      <div className="home-features">
        <div className="feature">
          <h3>Real-time Gameplay</h3>
          <p>
            Play poker with friends in real-time with our advanced gaming system
          </p>
        </div>
        <div className="feature">
          <h3>Realistic Cards</h3>
          <p>Experience poker with beautiful card designs and animations</p>
        </div>
        <div className="feature">
          <h3>Multiplayer</h3>
          <p>Invite friends and play together in the same virtual room</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
