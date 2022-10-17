import { gql } from "apollo-server-core"

const typeDefs = gql`
  scalar Date

  type Conversation {
    id: String
    participants: [Participant]
    latestMessage: Message
    timeCreated: Date
    timeUpdated: Date
  }

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type Query {
    conversations: [Conversation]
  }

  type createConversationResponse {
    conversationId: String
  }

  type Mutation {
    createConversation(participantIds: [String]): createConversationResponse
  }

  type Subscription {
    conversationCreated: Conversation
  }
`

export default typeDefs
