const { gql } = require('apollo-server');

// Define your GraphQL types and queries
const typeDefs = gql`
  type Player {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    shortName: String
    position: String!
    team: String
    status: String
    height: String
    weight: Int
    birthDate: String
    college: String
    experience: Int
    fantasyPosition: String
    active: Boolean
    positionCategory: String
    age: Int
    usaTodayPlayerID: Int
    usaTodayHeadshotUrl: String
    usaTodayHeadshotNoBackgroundUrl: String
  }

  type Query {
    allPlayers: [Player!]!
    getPlayer(id: ID!): Player  # Add a query to get a specific player by id
  }
`;

module.exports = typeDefs;
