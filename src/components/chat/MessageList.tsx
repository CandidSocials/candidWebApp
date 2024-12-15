import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './types';
import { ChatMessage } from './ChatMessage';
import { User } from '@supabase/supabase-js';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll inmediatamente para mensajes iniciales
    scrollToBottom();

    // Usar un pequeño delay para nuevos mensajes para asegurar que el DOM se ha actualizado
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages yet
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.sender_id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}