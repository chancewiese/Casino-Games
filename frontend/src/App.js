// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// Import components
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PokerRoom from "./pages/PokerRoom";
import NotFound from "./pages/NotFound";

// Configure axios - Check if we're running on localhost
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Set the base URL accordingly
axios.defaults.baseURL = isLocalhost
  ? "http://localhost:3000/api" // Development - point to backend server
  : "/api"; // Production - use relative path

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/poker" element={<PokerRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
