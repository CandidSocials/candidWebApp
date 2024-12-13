import { useAuth } from '@/lib/AuthProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { useChat } from '@/services/chatService/hooks';
import { ChatRoomProps, ChatMessage } from '@/services/types/chat.types';

export function ChatRoom({ chatId, className, onClose }: ChatRoomProps) {
  const { user } = useAuth();
  const {
    messages,
    loading,
    error,
    sendMessage,
    hasMore,
    loadMoreMessages
  } = useChat(chatId);

  if (!user) return null;

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-center">
            <p className="font-medium">Error loading messages</p>
            <p className="text-sm">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary-hover"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <ScrollArea className="flex-1 p-4">
          <MessageList
            messages={messages as ChatMessage[]}
            userId={user.id}
            hasMore={hasMore}
            onLoadMore={loadMoreMessages}
            isLoading={loading}
          />
        </ScrollArea>
        <div className="p-4 border-t">
          <MessageInput
            onSend={handleSendMessage}
            placeholder="Type a message..."
            maxLength={1000}
            showAttachmentButton={true}
          />
        </div>
      </>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {renderContent()}
    </div>
  );
}