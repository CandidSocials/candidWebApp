import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageListProps, ChatMessage } from '@/services/types/chat.types';
import { MessageItem } from './MessageItem';

export function MessageList({ 
  messages, 
  userId, 
  hasMore, 
  onLoadMore,
  isLoading 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (!isLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, onLoadMore, isLoading]);

  return (
    <ScrollArea className="flex-1 p-4">
      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadTriggerRef} className="h-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message: ChatMessage) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.sender_id === userId}
            showTimestamp={true}
            onDelete={() => {/* Implementar eliminación de mensajes */}}
            onEdit={(content) => {/* Implementar edición de mensajes */}}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}