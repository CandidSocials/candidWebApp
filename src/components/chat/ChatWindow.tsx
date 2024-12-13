import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { MessageSquare, X } from 'lucide-react';
import { ChatRoomList } from './ChatRoomList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineUsers } from './OnlineUsers';
import { useChat, useChatRooms } from '@/services/chatService/hooks';

export function ChatWindow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  
  // Usar los nuevos hooks centralizados
  const { rooms, loading: roomsLoading, error: roomsError } = useChatRooms();
  const { 
    messages, 
    sendMessage, 
    loading: messagesLoading, 
    error: messagesError,
    hasMore,
    loadMoreMessages 
  } = useChat(currentRoom || '');

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentRoom) return;
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
            {/* Lista de salas de chat */}
            <div className="w-1/3 border-r">
              {roomsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : roomsError ? (
                <div className="p-4 text-red-500 text-sm">{roomsError.message}</div>
              ) : (
                <ChatRoomList
                  rooms={rooms}
                  currentRoom={currentRoom}
                  userId={user.id}
                  onRoomSelect={setCurrentRoom}
                />
              )}
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 flex flex-col">
              {currentRoom ? (
                <>
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : messagesError ? (
                    <div className="p-4 text-red-500 text-sm">{messagesError.message}</div>
                  ) : (
                    <>
                      <MessageList
                        messages={messages}
                        userId={user.id}
                        hasMore={hasMore}
                        onLoadMore={loadMoreMessages}
                      />
                      <MessageInput onSend={handleSendMessage} />
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Selecciona un chat para comenzar
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;