import { Box } from "@chakra-ui/react"
import { Session } from "next-auth"
import * as React from "react"
import { useEffect } from "react"
import ConversationList from "./ConversationList"
import conversationOps from "../../../graphQL/ops/conversation"
import { useQuery } from "@apollo/client"
import { ConversationsData } from "../../../utils/types"
import { ConversationPopulated } from "../../../../../backend/src/utils/types"
import { useRouter } from "next/router"

interface Props {
  session: Session
}

const ConversationsWrapper: React.FC<Props> = ({ session }) => {
  // Find the conversations associated with the currently logged in user
  const {
    data: conversationsData,
    error: conersationsError,
    loading: conversationsLoading,
    // Subscribe to real time updates for conversations -
    subscribeToMore,
  } = useQuery<ConversationsData, null>(conversationOps.Queries.conversations)

  const router = useRouter()
  const {
    query: { conversationId },
  } = router

  console.log("query data", conversationsData)

  const onViewConversation = async (conversationId: string) => {
    // update url with conversationId using next router
    router.push({ query: { conversationId } })

    // mark the conversation as read
  }

  console.log(onViewConversation)

  // https://www.apollographql.com/docs/react/data/subscriptions/#subscribing-to-updates-for-a-query
  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: conversationOps.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated }
          }
        }
      ) => {
        if (!subscriptionData.data) return prev

        console.log("here is sub data", subscriptionData)

        const newConversation = subscriptionData.data.conversationCreated
        // Merge objects without mutating state
        return Object.assign({}, prev, {
          // prepend new conversation to conversations array
          conversations: [newConversation, ...prev.conversations],
        })
      },
    })
  }

  useEffect(() => {
    // Subscribe to new conversations on mount
    subscribeToNewConversations()
  }, [])

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
    >
      {/* Skell loader */}
      <ConversationList
        session={session}
        conversations={conversationsData?.conversations || []}
        onViewConversation={onViewConversation}
      />
    </Box>
  )
}

export default ConversationsWrapper
