import { Flex } from "@chakra-ui/react"
import { Session } from "next-auth"
import { useRouter } from "next/router"
import * as React from "react"
import MessagesHeader from "./messages/Header"

interface Props {
  session: Session
}

const FeedWrapper: React.FunctionComponent<Props> = ({ session }) => {
  const router = useRouter()
  // Extract the conversation ID from url
  const { conversationId } = router.query
  console.log(conversationId)

  const {
    user: { id: userId },
  } = session

  return (
    <Flex
      width="100%"
      direction="column"
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
    >
      {conversationId && typeof conversationId === "string" ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexGrow={1}
        >
          <MessagesHeader userId={userId} conversationId={conversationId} />
          {conversationId}
        </Flex>
      ) : (
        <div>no convo</div>
      )}
    </Flex>
  )
}

export default FeedWrapper
