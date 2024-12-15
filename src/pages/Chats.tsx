import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useMessages } from '@/components/chat/hooks/useMessages';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { OnlineUsers } from '@/components/chat/OnlineUsers';
import { usePresence } from '@/components/chat/hooks/usePresence';

export function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUsers } = usePresence();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { messages, loading, error, sendMessage } = useMessages(selectedUser || '');

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-[600px]">
          {/* Online Users List */}
          <div className="w-1/4 border-r">
            <OnlineUsers 
              onlineUsers={onlineUsers} 
              selectedUserId={selectedUser}
              onUserSelect={setSelectedUser}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            {selectedUser ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4">
                  <MessageList messages={messages} currentUser={user} />
                </div>
                <div className="p-4 border-t">
                  <MessageInput onSend={sendMessage} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a user to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}