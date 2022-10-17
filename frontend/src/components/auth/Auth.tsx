import { Button, Center, Input, Stack, Text } from "@chakra-ui/react"
import { Session } from "next-auth"
import { signIn } from "next-auth/react"
import { useState } from "react"
import GoogleButton from "react-google-button"
import { gql, useMutation, useQuery } from "@apollo/client"
import userOps from "../../graphQL/ops/user"
import { CreateUsernameData, CreateUsernameParams } from "../../utils/types"
import toast from "react-hot-toast"

interface Props {
  session: Session | null
  reloadSession: () => void
}

const Auth: React.FunctionComponent<Props> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("")

  const [createUsername, { data, loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameParams
  >(userOps.Mutations.createUsername)

  const onSubmit = async () => {
    if (!username) return

    try {
      const { data } = await createUsername({
        variables: {
          username,
        },
      })

      if (!data?.createUsername) {
        throw new Error()
      }

      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data

        toast.error(error)
        return
      }

      toast.success("Username successfully created")

      /**
       * Reload session to obtain new username
       */
      reloadSession()
    } catch (error) {
      toast.error("There was an error")
      console.log("onSubmit error", error)
    }
  }

  return (
    <Center height="100vh">
      <Stack align="center" spacing={6}>
        {session ? (
          <>
            <Text fontSize="3xl">Create username</Text>
            <Input
              placeholder="Enter a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button width="100%" onClick={onSubmit} isLoading={loading}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="3xl">MessengerQL</Text>
            <GoogleButton onClick={() => signIn("google")} />
          </>
        )}
      </Stack>
    </Center>
  )
}

export default Auth
