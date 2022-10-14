import { gql } from "apollo-server-core"

const typeDefs = gql`
  type createConversationResponse {
    conversationId: String
  }

  type Mutation {
    createConversation(participantIds: [String]): createConversationResponse
  }
`

export default typeDefs
