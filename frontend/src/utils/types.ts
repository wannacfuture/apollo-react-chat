import { ConversationPopulated } from "./../../../backend/src/utils/types"

/**
 * Users
 */

interface CreateUsernameData {
  createUsername: {
    success: boolean
    error: string
  }
}

interface CreateUsernameParams {
  username: string
}

interface SearchUsersInput {
  username: string
}

interface SearchUsersData {
  searchUsers: SearchedUser[]
}

interface SearchedUser {
  id: string
  username: string
  image: string
}

/**
 * Conversations
 */

interface ConversationsData {
  conversations: ConversationPopulated[]
}

interface CreateConversationInput {
  participantIds: string[]
}

interface CreateConversationData {
  createConversation: {
    conversationId: string
  }
}

export type {
  CreateUsernameData,
  CreateUsernameParams,
  SearchUsersInput,
  SearchUsersData,
  SearchedUser,
  ConversationsData,
  CreateConversationInput,
  CreateConversationData,
}
