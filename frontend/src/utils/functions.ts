import { ParticipantPopulated } from "./../../../backend/src/utils/types"

const formatUsernames = (
  participants: Array<ParticipantPopulated>,
  myUserId: string
): string => {
  const usernames = participants
    .filter((participant) => participant.user.id != myUserId)
    .map((participant) => participant.user.username)

  return usernames.join(", ")
}
export { formatUsernames }
