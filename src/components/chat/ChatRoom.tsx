import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useChat } from '@/services/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    loading,
    error,
    sendMessage
  } = useChat(chatId || '');

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!user || !chatId) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-600">
        {error.message || 'An error occurred loading messages'}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          userId={user.id}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}