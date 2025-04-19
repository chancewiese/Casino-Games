// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// Import components
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PokerRoom from "./pages/PokerRoom";
import NotFound from "./pages/NotFound";

// Set axios defaults - Use relative path for API
axios.defaults.baseURL = "/api";

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
