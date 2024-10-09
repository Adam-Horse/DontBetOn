const axios = require('axios');

const apiKey = '5dab2604afc042bdb0aa4dddd9f1ac28';  // Replace with your API key
const apiUrl = `https://api.sportsdata.io/v3/nfl/scores/json/PlayersByAvailable?key=${apiKey}`;

// Define and export the function to fetch player profiles
const fetchPlayerProfiles = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error fetching player profiles:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { fetchPlayerProfiles };  // Ensure the function is exported correctly
