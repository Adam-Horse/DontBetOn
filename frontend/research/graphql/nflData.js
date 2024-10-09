const axios = require('axios');

// Your API key from Sportsdata.io
const API_KEY = '5dab2604afc042bdb0aa4dddd9f1ac28
';

// Define the base URL for the NFL API
const BASE_URL = 'https://api.sportsdata.io/v3/nfl/scores/json';

// Function to fetch player stats
const getPlayerStats = async (playerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/Player/${playerId}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': 5dab2604afc042bdb0aa4dddd9f1ac28
,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching player stats:', error);
  }
};

// Function to fetch team stats
const getTeamStats = async (teamId) => {
  try {
    const response = await axios.get(`${BASE_URL}/Team/${teamId}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': 5dab2604afc042bdb0aa4dddd9f1ac28
,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching team stats:', error);
  }
};

// Example usage: Fetch stats for a specific player or team
getPlayerStats(12345);  // Replace 12345 with an actual player ID
getTeamStats(10);       // Replace 10 with an actual team ID
