import { ApolloError } from "apollo-server-express"
import { GraphQLContext } from "../../utils/types"

const resolvers = {
  //   Query: {},
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: string[] },
      context: GraphQLContext
    ) => {
      const { session, prisma } = context
      const { participantIds } = args

      if (!session?.user) {
        throw new ApolloError("Not authorised")
      }

      const {
        user: { id: userId },
      } = session

      try {
      } catch (error) {
        console.log("Error creating conversation: ", error)
        throw new ApolloError("Error creating conversation")
      }
    },
  },
}

export default resolvers
