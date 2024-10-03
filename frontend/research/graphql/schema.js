const { gql } = require('apollo-server');

// Define the GraphQL schema
const typeDefs = gql`
  type Player {
    id: ID!
    name: String!
    position: String!
    team: Team!
    traditionalStats: TraditionalStats
    nonTraditionalMetrics: NonTraditionalMetrics
  }

  type Team {
    id: ID!
    name: String!
    coach: Coach!
    owner: Owner!
    traditionalStats: TraditionalStats
    nonTraditionalMetrics: NonTraditionalMetrics
  }

  type Coach {
    id: ID!
    name: String!
    experience: Int!
  }

  type Owner {
    id: ID!
    name: String!
    netWorth: Float!
  }

  type TraditionalStats {
    gamesPlayed: Int!
    yards: Float!
    touchdowns: Int!
    interceptions: Int!
  }

  type NonTraditionalMetrics {
    fatigue: Int
    weatherImpact: Float
    offFieldIncidents: Int
    coachDecisionsImpact: Float
  }

  type Query {
    getPlayer(id: ID!): Player
    getTeam(id: ID!): Team
    allPlayers: [Player!]!
    allTeams: [Team!]!
  }
`;

module.exports = typeDefs;
