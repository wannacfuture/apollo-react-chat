import {
  Stack,
  Text,
  Avatar,
  Box,
  Flex,
  Menu,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { formatRelative } from "date-fns"
import enUS from "date-fns/locale/en-US"
import React, { useState } from "react"
import { ConversationPopulated } from "../../../../../backend/src/utils/types"
import conversationOps from "../../../graphQL/ops/conversation"
import { GoPrimitiveDot } from "react-icons/go"
import { MdDeleteOutline } from "react-icons/md"
import { BiLogOut } from "react-icons/bi"
import { AiOutlineEdit } from "react-icons/ai"
import { formatUsernames } from "../../../utils/functions"

const formatRelativeLocale = {
  lastWeek: "eeee",
  yesterday: "'Yesterday",
  today: "p",
  other: "MM/dd/yy",
}

interface Props {
  userId: string
  conversation: ConversationPopulated
  onClick: () => void
  isSelected: boolean
  //   onEditConversation?: () => void;
  //   hasSeenLatestMessage?: boolean;
  //   selectedConversationId?: string;
  //   onDeleteConversation?: (conversationId: string) => void;
  //   onLeaveConversation?: (conversation: ConversationPopulated) => void;
}

const ConversationItem: React.FC<Props> = ({
  userId,
  conversation,
  onClick,
  isSelected,
  //   selectedConversationId,
  //   hasSeenLatestMessage,
  //   onEditConversation,
  //   onDeleteConversation,
  //   onLeaveConversation,
}) => {
  console.log("HERE IS CONVERSATION", conversation)

  const [menuOpen, setMenuOpen] = useState(false)

  const handleClick = (event: React.MouseEvent) => {
    if (event.type === "click") {
      onClick()
    } else if (event.type === "contextmenu") {
      event.preventDefault()
      setMenuOpen(true)
    }
  }

  return (
    <Stack
      direction="row"
      align="center"
      justify="space-between"
      p={4}
      cursor="pointer"
      borderRadius={4}
      bg={isSelected ? "whiteAlpha.200" : "none"}
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={handleClick}
      onContextMenu={handleClick}
      position="relative"
    >
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuList bg="#2d2d2d">
          <MenuItem
            icon={<AiOutlineEdit fontSize={20} />}
            onClick={(event) => {
              event.stopPropagation()
              //   onEditConversation();
            }}
          >
            Edit
          </MenuItem>
          {conversation.participants.length > 2 ? (
            <MenuItem
              icon={<BiLogOut fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation()
                // onLeaveConversation(conversation);
              }}
            >
              Leave
            </MenuItem>
          ) : (
            <MenuItem
              icon={<MdDeleteOutline fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation()
                // onDeleteConversation(conversation.id);
              }}
            >
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Menu>
      {/* <Flex position="absolute" left="-6px">
        {hasSeenLatestMessage === false && (
          <GoPrimitiveDot fontSize={18} color="#6B46C1" />
        )}
      </Flex> */}
      <Avatar />
      <Flex justify="space-between" width="80%" height="100%">
        <Flex direction="column" width="70%" height="100%">
          <Text
            fontWeight={600}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.latestMessage && (
            <Box width="140%">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {conversation.latestMessage.body}
              </Text>
            </Box>
          )}
        </Flex>
        <Text
          color="whiteAlpha.700"
          textAlign="right"
          position="absolute"
          right={4}
        >
          {formatRelative(new Date(conversation.timeUpdated), new Date(), {
            locale: {
              ...enUS,
              formatRelative: (token) =>
                formatRelativeLocale[
                  token as keyof typeof formatRelativeLocale
                ],
            },
          })}
        </Text>
      </Flex>
    </Stack>
  )
}
export default ConversationItem
