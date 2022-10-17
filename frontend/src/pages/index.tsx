import { Box } from "@chakra-ui/react"
import type { NextPage, NextPageContext } from "next"
import { getSession, useSession } from "next-auth/react"
import Auth from "../components/auth/Auth"
import Chat from "../components/Chat/Chat"
import { Session } from "next-auth"

const Home: NextPage = () => {
  const { data: session } = useSession()
  console.log(session)

  const reloadSession = () => {
    const event = new Event("visibilitychange")
    document.dispatchEvent(event)
  }

  return (
    <Box>
      {session?.user.username ? (
        <Chat session={session} />
      ) : (
        <Auth session={session} reloadSession={reloadSession} />
      )}
    </Box>
  )
}

export async function getServerSideProps(ctx: NextPageContext) {
  const session = await getSession(ctx)

  return {
    props: {
      session,
    },
  }
}

export default Home
