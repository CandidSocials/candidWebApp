import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMessages } from './hooks/useMessages'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useAuth } from '@/lib/AuthProvider'
import { ChatProps } from './types'

export function Chat({ chatId, otherUserId, otherUserName }: ChatProps) {
  const { user } = useAuth()
  const { messages, loading, sendMessage } = useMessages(chatId)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Debug logs
  console.log('[Chat] Component rendered with props:', { 
    chatId, 
    otherUserId, 
    otherUserName,
    isUserAuthenticated: !!user,
    userId: user?.id
  });
  console.log('[Chat] Messages state:', {
    messageCount: messages.length,
    loading,
    lastMessage: messages[messages.length - 1]
  });

  useEffect(() => {
    console.log('[Chat] Messages updated:', {
      newMessageCount: messages.length,
      lastMessage: messages[messages.length - 1]
    });
    
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    console.log('[Chat] handleSendMessage called:', { 
      content, 
      otherUserId,
      chatId,
      currentUserId: user?.id 
    });
    console.log('Attempting to send message:', { content, otherUserId });
    if (!otherUserId) {
      console.error('No otherUserId provided');
      return;
    }
    if (!user) {
      console.error('No user logged in');
      return;
    }
    try {
      const result = await sendMessage(content, otherUserId);
      console.log('Message sent successfully:', result);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    console.log('Chat is loading...');
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
            messages.map((message) => {
              console.log('Rendering message:', message);
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === user?.id}
                  otherUserName={otherUserName}
                />
              );
            })
          )}
        </div>
      </ScrollArea>
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}