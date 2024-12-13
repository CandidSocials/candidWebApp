import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useChatRooms } from '@/components/chat/hooks/useChatRooms';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { OnlineUsers } from '@/components/chat/OnlineUsers';
import { usePresence } from '@/components/chat/hooks/usePresence';
import { ChatParticipant } from '@/services/types/chat.types';

export function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, error: roomsError } = useChatRooms();
  const { onlineUsers } = usePresence();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Convert onlineUsers to ChatParticipant array
  const onlineParticipants: ChatParticipant[] = Object.entries(onlineUsers || {}).map(([userId, data]) => ({
    user_id: userId,
    last_seen: new Date().toISOString(),
    profile: {
      full_name: data?.profile?.full_name || 'Unknown User'
    }
  }));

  if (roomsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="text-center text-red-600 p-4">
        {roomsError.message || 'An error occurred loading chat rooms'}
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
          <OnlineUsers 
            users={onlineParticipants} 
            isLoading={roomsLoading}
          />
        </div>
      </div>
    </div>
  );
}