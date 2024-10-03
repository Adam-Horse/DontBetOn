const players = [
  {
    id: '1',
    name: 'Player One',
    position: 'Quarterback',
    team: { id: '1', name: 'Team A' },
    traditionalStats: { gamesPlayed: 10, yards: 3000, touchdowns: 30, interceptions: 5 },
    nonTraditionalMetrics: { fatigue: 2, weatherImpact: 1.5, offFieldIncidents: 0, coachDecisionsImpact: 3.2 }
  },
  // Add more player data here
];

const teams = [
  {
    id: '1',
    name: 'Team A',
    coach: { id: '1', name: 'Coach A', experience: 10 },
    owner: { id: '1', name: 'Owner A', netWorth: 5000000 },
    traditionalStats: { gamesPlayed: 16, yards: 5000, touchdowns: 50, interceptions: 15 },
    nonTraditionalMetrics: { fatigue: 5, weatherImpact: 2.0, offFieldIncidents: 3, coachDecisionsImpact: 4.5 }
  },
  // Add more team data here
];

const resolvers = {
  Query: {
    getPlayer: (_, { id }) => players.find(player => player.id === id),
    getTeam: (_, { id }) => teams.find(team => team.id === id),
    allPlayers: () => players,
    allTeams: () => teams,
  }
};

module.exports = resolvers;
