import { Stack, Text } from "@chakra-ui/react"
import { ConversationPopulated } from "../../../../../backend/src/utils/types"
import conversationOps from "../../../graphQL/ops/conversation"

interface Props {
  conversation: ConversationPopulated
}

const ConversationElement: React.FunctionComponent<Props> = ({
  conversation,
}) => {
  return (
    <Stack p={4} _hover={{ bg: "whiteAlpha.200" }} borderRadius={4}>
      <Text>{conversation.id}</Text>
    </Stack>
  )
}

export default ConversationElement
