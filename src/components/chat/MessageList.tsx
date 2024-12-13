import { useRef, useEffect } from 'react';
import { ChatMessage } from '@/services/types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
  userId: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function MessageList({ messages, userId, hasMore, onLoadMore }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender_id === userId
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {message.sender_id === userId ? 'You' : message.sender_name}
            </p>
            <p className="text-sm break-words">{message.content}</p>
            <p className="text-xs mt-1 opacity-75">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}