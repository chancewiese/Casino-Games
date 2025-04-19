// debugConnection.js
// Add this script to the root of your frontend folder and run with
// node debugConnection.js to verify your connection settings

const axios = require("axios");

// Test various connection settings
async function testConnection() {
  console.log("============ Debug Connection Test ============");

  // 1. Test backend direct connection
  try {
    const response = await axios.get("http://localhost:3000/api/test");
    console.log("✅ Backend API connection successful:", response.data);
  } catch (error) {
    console.error("❌ Backend API connection failed:", error.message);
    console.log("Is your backend server running on port 3000?");
  }

  // 2. Test frontend connectivity (if running)
  try {
    const response = await axios.get("http://localhost:8080");
    console.log("✅ Frontend server is running on port 8080");
  } catch (error) {
    console.error("❌ Frontend connection test failed:", error.message);
  }

  // 3. Log the hostname for reference
  console.log("Current hostname:", require("os").hostname());

  console.log("===============================================");
  console.log("Instructions:");
  console.log("1. Make sure your backend is running on port 3000");
  console.log("2. Make sure your frontend is running on port 8080");
  console.log("3. If both are running and still experiencing issues,");
  console.log("   check the baseURL in App.js and PokerRoom.js");
  console.log("===============================================");
}

testConnection();
