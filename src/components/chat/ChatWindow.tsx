import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { MessageSquare, X } from 'lucide-react';
import { ChatRoomList } from './ChatRoomList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineUsers } from './OnlineUsers';
import { useChatRooms } from './hooks/useChatRooms';
import { useMessages } from './hooks/useMessages';
import { usePresence } from './hooks/usePresence';

export function ChatWindow() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const { rooms } = useChatRooms();
  const { messages } = useMessages(currentRoom);
  const { onlineUsers } = usePresence();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || !user) return;

    try {
      await supabase.from('chat_messages').insert([
        {
          room_id: currentRoom,
          sender_id: user.id,
          content: newMessage.trim(),
        },
      ]);
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
        <div className="bg-white rounded-t-lg shadow-xl w-96 h-[600px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-primary text-white rounded-t-lg">
            <h2 className="font-semibold">Chat</h2>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex">
            <ChatRoomList
              rooms={rooms}
              currentRoom={currentRoom}
              userId={user.id}
              onRoomSelect={setCurrentRoom}
            />

            <div className="flex-1 flex flex-col">
              <MessageList messages={messages} userId={user.id} />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSubmit={handleSendMessage}
              />
            </div>

            <OnlineUsers onlineUsers={onlineUsers} />
          </div>
        </div>
      )}
    </div>
  );
}