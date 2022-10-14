import { Prisma, PrismaClient } from "@prisma/client"

/**
 * Server Configuration
 */
interface Session {
  user?: User
}

interface GraphQLContext {
  session: Session | null
  prisma: PrismaClient
  //   pubsub: PubSub;
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

export type {
  Session,
  GraphQLContext,
  User,
  CreateUsernameResponse,
  SearchUsersResponse,
}
