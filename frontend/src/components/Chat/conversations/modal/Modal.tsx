import { useLazyQuery, useMutation } from "@apollo/client"
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react"
import { Session } from "next-auth"
import { useRouter } from "next/router"
import * as React from "react"
import { useState } from "react"
import toast from "react-hot-toast"
import conversationOps from "../../../../graphQL/ops/conversation"
import userOps from "../../../../graphQL/ops/user"
import {
  CreateConversationData,
  CreateConversationInput,
  SearchedUser,
  SearchUsersData,
  SearchUsersInput,
} from "../../../../utils/types"
import Participants from "./Participants"
import UserSearchList from "./UserSearchList"

interface Props {
  isOpen: boolean
  onClose: () => void
  session: Session
}

const ConversationModal: React.FC<Props> = ({ isOpen, onClose, session }) => {
  const {
    user: { id: userId },
  } = session

  const router = useRouter()

  const [username, setUsername] = React.useState("")
  const [participants, setParticipants] = useState<SearchedUser[]>([])

  const [searchUsers, { data, error, loading }] = useLazyQuery<
    SearchUsersData,
    SearchUsersInput
  >(userOps.Queries.searchUsers)

  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationInput>(
      conversationOps.Mutations.createConversation
    )

  // const {
  //   user: { id: userId }
  // } = session

  //Append participant to current conversation participants array
  const addParticipant = (user: SearchedUser) => {
    // Append the new user to the participants array
    setParticipants((prev) => [...prev, user])
    setUsername("")
  }
  //Remove participant from current conversation participants array
  const removeParticipant = (userId: string) => {
    // Allow all users to participants array other than one being removed
    setParticipants((prev) => prev.filter((p) => p.id !== userId))
  }

  const onCreateConversation = async () => {
    // Extract the participant IDs from the participants array
    let participantIds = participants.map((participant) => participant.id)
    // Add user creating conversaation to participants
    participantIds = [userId, ...participantIds]
    try {
      // Mutate conversation
      const { data } = await createConversation({
        variables: {
          participantIds: participantIds,
        },
      })

      // if data retreived is null or unnefined
      if (!data?.createConversation) {
        throw new Error("Failed to create conversation")
      }

      // destructure the conversation ID
      const {
        createConversation: { conversationId },
      } = data

      // Add converstaiton ID to url
      router.push({ query: { conversationId } })

      // Clear state upon successful conversation creation
      setParticipants([])
      setUsername("")
      // Close the modal
      onClose()

      console.log(data, "here is x")
      console.log(participantIds)
    } catch (error: any) {
      console.log("create convo error", error)
      toast.error(error?.message)
    }
  }

  const onSearch = (e: React.FormEvent) => {
    event?.preventDefault()

    searchUsers({ variables: { username } })

    console.log(username)
  }
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#2d2d2d" pb={4}>
          <ModalHeader>Create a Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSearch}>
              <Stack spacing={4}>
                <Input
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button type="submit" disabled={!username} isLoading={loading}>
                  Search
                </Button>
              </Stack>
            </form>

            {data?.searchUsers && (
              <UserSearchList
                users={data.searchUsers}
                addParticipant={addParticipant}
              />
            )}
            {participants.length !== 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipant={removeParticipant}
                />
                <Button
                  mt="4"
                  bg="brand.100"
                  width="100%"
                  _hover={{ bg: "brand.100" }}
                  isLoading={createConversationLoading}
                  onClick={onCreateConversation}
                >
                  Create Conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConversationModal
