import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useChatRooms } from '@/components/chat/hooks/useChatRooms';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { OnlineUsers } from '@/components/chat/OnlineUsers';
import { usePresence } from '@/components/chat/hooks/usePresence';

export function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, loading, error } = useChatRooms();
  const { onlineUsers } = usePresence();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

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
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-[600px]">
          {/* Chat Room List */}
          <div className="w-1/4 border-r">
            <ChatRoomList
              rooms={rooms}
              currentRoom={selectedRoom}
              userId={user.id}
              onRoomSelect={setSelectedRoom}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            {selectedRoom ? (
              <ChatRoom chatId={selectedRoom} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a chat to start messaging
              </div>
            )}
          </div>

          {/* Online Users */}
          <div className="w-1/4 border-l">
            <OnlineUsers onlineUsers={onlineUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}