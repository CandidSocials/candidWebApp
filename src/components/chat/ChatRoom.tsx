import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { useMessages } from './hooks/useMessages';

interface ChatRoomProps {
  chatId: string;
}

export function ChatRoom({ chatId }: ChatRoomProps) {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, loading, error, sendMessage } = useMessages(chatId);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user) return null;
  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <MessageList messages={messages} userId={user.id} />
      </ScrollArea>
      <MessageInput onSend={sendMessage} />
    </div>
  );
}