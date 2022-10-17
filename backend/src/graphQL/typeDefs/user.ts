import { gql } from "apollo-server-core"

const typeDefs = gql`
  type User {
    id: String
    username: String
    name: String
    email: String
    emailVerified: Boolean
    image: String
  }

  type SearchedUser {
    id: String
    username: String
    image: String
  }

  type Query {
    searchUsers(username: String): [SearchedUser]
  }

  type createUsernameResponse {
    success: Boolean
    error: String
  }

  type Mutation {
    createUsername(username: String): createUsernameResponse
  }
`

export default typeDefs
