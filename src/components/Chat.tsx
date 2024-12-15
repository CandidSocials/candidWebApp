import { useRef, useEffect } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { useMessages } from '@/hooks/useMessages'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { ChatProps } from './types'

export function Chat({ jobId, otherUserId, otherUserName }: ChatProps) {
  const { user } = useAuth()
  const { messages, loading, sendMessage } = useMessages(otherUserId, jobId)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !otherUserId || !user) return;
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.sender_profile?.id === user?.id}
                otherUserName={otherUserName}
              />
            ))
          )}
        </div>
      </ScrollArea>
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
