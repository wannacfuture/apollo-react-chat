import { Prisma, PrismaClient } from "./../../node_modules/@prisma/client"
import {
  conversationPopulated,
  participantPopulated,
} from "./../graphQL/resolvers/conversation"
import { Context } from "graphql-ws/lib/server"
import { PubSub } from "graphql-subscriptions"

/**
 * Server Configuration
 */
interface Session {
  user?: User
}

interface GraphQLContext {
  session: Session | null
  prisma: PrismaClient
  pubsub: PubSub
}

interface SubscriptionContext extends Context {
  connectionParams: {
    // User may not always be signed in so session is optional
    session?: Session
  }
}

/**
 * Users
 */
interface User {
  id: string
  username: string
  email: string
  emailVerified: boolean
  image: string
  name: string
}

interface CreateUsernameResponse {
  success?: boolean
  error?: string
}

interface SearchUsersResponse {
  users: Array<User>
}

/**
 * Conversations
 */
type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated
}>

type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated
}>

// export type ParticipantPopulated = Prisma.Particip

export type {
  Session,
  GraphQLContext,
  User,
  CreateUsernameResponse,
  SearchUsersResponse,
  ConversationPopulated,
  ParticipantPopulated,
  SubscriptionContext,
}
