import { Flex } from "@chakra-ui/react"
import { Session } from "next-auth"
import { useRouter } from "next/router"
import * as React from "react"

interface Props {
  session: Session
}

const FeedWrapper: React.FunctionComponent<Props> = ({ session }) => {
  const router = useRouter()
  // Extract the conversation ID from url
  const { conversationId } = router.query

  return (
    <Flex
      border="red 1px solid"
      width="100%"
      direction="column"
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
    >
      {conversationId ? <Flex>{conversationId}</Flex> : <div>no convo</div>}
    </Flex>
  )
}

export default FeedWrapper
