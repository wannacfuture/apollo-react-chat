import { Prisma } from "@prisma/client"
import { ApolloError } from "apollo-server-express"
import { AnyMxRecord } from "dns"
import { ConversationPopulated, GraphQLContext } from "../../utils/types"
import { withFilter } from "graphql-subscriptions"

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      args: any,
      context: GraphQLContext
    ): Promise<ConversationPopulated[]> => {
      const { session, prisma } = context

      if (!session?.user) {
        throw new ApolloError("Not authorized")
      }
      // Get the user's ID from next auth session
      const {
        user: { id: userId },
      } = session

      try {
        const conversations = await prisma.conversation.findMany({
          include: conversationPopulated,
        })

        // Temp fix due to Prisma query bug
        conversations.filter((conversation) =>
          Boolean(
            conversation.participants.find(
              (participant) => participant.userId === userId
            )
          )
        )

        return conversations
      } catch (error: any) {
        console.log("conversation error: ", error)
        throw new ApolloError(error?.message)
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: string[] },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context
      const { participantIds } = args

      if (!session?.user) {
        throw new ApolloError("Not authorised")
      }

      const {
        user: { id: userId },
      } = session

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  // if user who created the conversation mark as read automatically
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        })

        // Notify pubsub of conversation created
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        })

        return {
          conversationId: conversation.id,
        }
      } catch (error) {
        console.log("Error creating conversation: ", error)
        throw new ApolloError("Error creating conversation")
      }
    },
  },

  // Listen for subscription event
  // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#listening-for-events
  Subscription: {
    conversationCreated: {
      // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#filtering-events
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context

          return pubsub.asyncIterator(["CONVERSATION_CREATED"])
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context

          if (!session?.user) {
            throw new ApolloError("Not authorized")
          }

          const { id: userId } = session.user
          const {
            conversationCreated: { participants },
          } = payload

          const userIsConversationParticipant = Boolean(
            participants.find(
              (participant) => participant.userId === session?.user?.id
            )
          )
          return userIsConversationParticipant
        }
      ),
    },
  },
}

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  })

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  })

export default resolvers
