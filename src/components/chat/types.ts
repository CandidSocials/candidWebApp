export interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  sender_full_name: string
  read: boolean
}

export interface ChatProps {
  chatId: string
  otherUserName: string
}

export interface ChatModalProps {
  chatId: string
  jobTitle: string
  otherUserName: string
}

export interface MessageItemProps {
  message: Message
  isOwnMessage: boolean
  otherUserName: string
}

export interface MessageInputProps {
  onSend: (message: string) => Promise<void>
}