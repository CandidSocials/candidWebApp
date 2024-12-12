import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMessages } from './hooks/useMessages'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useAuth } from '@/lib/AuthProvider'
import { ChatRoomProps } from './types'

export function ChatRoom({ chatId, otherUserName }: ChatRoomProps) {
  const { user } = useAuth()
  const { messages, loading, sendMessage } = useMessages(chatId)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === user?.id}
              otherUserName={otherUserName}
            />
          ))}
        </div>
      </ScrollArea>
      <MessageInput onSend={sendMessage} />
    </div>
  )
}