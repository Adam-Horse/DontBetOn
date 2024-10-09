const { fetchPlayerProfiles } = require('./getPlayers'); // Import the function to fetch player profiles

const resolvers = {
  Query: {
    allPlayers: async () => {
      try {
        const players = await fetchPlayerProfiles();
        return players.map(player => ({
          id: player.PlayerID,
          firstName: player.FirstName,
          lastName: player.LastName,
          fullName: player.Name,
          shortName: player.ShortName,
          position: player.Position,
          team: player.Team || 'No Team',
          status: player.Status,
          height: player.Height,
          weight: player.Weight,
          birthDate: player.BirthDate,
          college: player.College,
          experience: player.Experience,
          fantasyPosition: player.FantasyPosition,
          active: player.Active,
          positionCategory: player.PositionCategory,
          age: player.Age,
          usaTodayPlayerID: player.UsaTodayPlayerID,
          usaTodayHeadshotUrl: player.UsaTodayHeadshotUrl,
          usaTodayHeadshotNoBackgroundUrl: player.UsaTodayHeadshotNoBackgroundUrl,
        }));
      } catch (error) {
        console.error('Error fetching player profiles:', error.message);
        throw new Error('Failed to fetch player profiles');
      }
    },
    
    // Resolver for fetching a specific player by id
    getPlayer: async (_, { id }) => {
      try {
        const players = await fetchPlayerProfiles(); // Fetch all player profiles
        const player = players.find(player => player.PlayerID == id); // Find the specific player by ID

        if (!player) {
          throw new Error(`Player with id ${id} not found`);
        }

        // Return the specific player data
        return {
          id: player.PlayerID,
          firstName: player.FirstName,
          lastName: player.LastName,
          fullName: player.Name,
          shortName: player.ShortName,
          position: player.Position,
          team: player.Team || 'No Team',
          status: player.Status,
          height: player.Height,
          weight: player.Weight,
          birthDate: player.BirthDate,
          college: player.College,
          experience: player.Experience,
          fantasyPosition: player.FantasyPosition,
          active: player.Active,
          positionCategory: player.PositionCategory,
          age: player.Age,
          usaTodayPlayerID: player.UsaTodayPlayerID,
          usaTodayHeadshotUrl: player.UsaTodayHeadshotUrl,
          usaTodayHeadshotNoBackgroundUrl: player.UsaTodayHeadshotNoBackgroundUrl,
        };
      } catch (error) {
        console.error(`Error fetching player with id ${id}:`, error.message);
        throw new Error('Failed to fetch player');
      }
    }
  }
};

module.exports = resolvers;
