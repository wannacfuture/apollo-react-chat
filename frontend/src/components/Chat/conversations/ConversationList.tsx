import { Box, Text } from "@chakra-ui/react"
import { Session } from "next-auth"
import { useRouter } from "next/router"
import * as React from "react"
import { useState } from "react"
import { ConversationPopulated } from "../../../../../backend/src/utils/types"
import ConversationElement from "./ConversationElement"
import ConversationModal from "./modal/Modal"

interface Props {
  session: Session
  conversations: ConversationPopulated[]
  onViewConversation: (conversationId: string) => void
}

const ConversationList: React.FC<Props> = ({
  session,
  conversations,
  onViewConversation,
}) => {
  console.log(onViewConversation)

  const router = useRouter()
  const {
    user: { id: userId },
  } = session
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = () => {
    setIsOpen(true)
  }

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Box width="100%">
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpen}
      >
        <Text textAlign="center" color="whiteAlpha.800" fontWeight={500}>
          Find or start a conversation
        </Text>
      </Box>
      <ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
      {conversations.map((conversation) => (
        <ConversationElement
          key={conversation.id}
          conversation={conversation}
          onClick={() => onViewConversation(conversation.id)}
          isSelected={conversation.id === router.query.conversationId}
          userId={userId}
        />
      ))}
    </Box>
  )
}

export default ConversationList
