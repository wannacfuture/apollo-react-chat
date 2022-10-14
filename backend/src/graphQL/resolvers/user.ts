import { CreateUsernameResponse, GraphQLContext } from "../../utils/types"
import { ApolloError } from "apollo-server-express"
import { User } from "@prisma/client"

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<User[]> => {
      const { username: searchedUsername } = args
      const { session, prisma } = context

      if (!session?.user) {
        throw new ApolloError("Not authorised")
      }

      const {
        user: { username: myUsername },
      } = session

      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: searchedUsername,
              // don't include user searching
              not: myUsername,
              // allow any case
              mode: "insensitive",
            },
          },
        })

        return users
      } catch (error: any) {
        console.log("search user error", error)
        throw new ApolloError(error?.message)
      }
    },
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      // Obtain username from passed args
      const { username } = args
      const { session, prisma } = context

      if (!session?.user) {
        return {
          error: "Not authorized",
        }
      }

      const { id: userId } = session.user

      try {
        // Confirm unique username
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        })

        // If username taken
        if (existingUser) {
          return {
            error: "Username taken...",
          }
        }

        // Create new unique username
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username,
          },
        })

        return { success: true }
      } catch (error: any) {
        console.log("createUsername error", error)
        return {
          error: error?.message,
        }
      }
    },
  },
}

export default resolvers
