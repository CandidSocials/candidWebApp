import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { MessageSquare, X } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from './hooks/useMessages';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
}

export function ChatWindow({ otherUserId, otherUserName }: ChatWindowProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const { messages, loading, error, sendMessage } = useMessages(otherUserId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{otherUserName}</h2>
              <p className="text-sm text-gray-500">
                {messages.some(m => m.receiver_id === user.id && !m.read) ? 'New messages' : 'Chat'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-gray-500 mt-4">Loading messages...</div>
            ) : error ? (
              <div className="text-center text-red-500 mt-4">Error loading messages</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <MessageList messages={messages} currentUser={user} />
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <MessageInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onSubmit={handleSendMessage}
            />
          </form>
        </div>
      )}
    </div>
  );
}