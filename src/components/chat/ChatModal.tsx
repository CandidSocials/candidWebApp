import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useChat } from '@/services/chatService/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { useAuth } from '@/lib/AuthProvider';

interface ChatModalProps {
  chatId: string;
  jobTitle: string;
  otherUserName: string;
}

export function ChatModal({ chatId, jobTitle, otherUserName }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const {
    messages,
    loading,
    error,
    sendMessage,
    hasMore,
    loadMoreMessages
  } = useChat(chatId);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Error sending message:', err);
      // Aquí podrías mostrar un toast o notificación de error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat - {jobTitle}</DialogTitle>
          <div className="text-sm text-gray-500">
            Chatting with {otherUserName}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              {error.message}
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <MessageList
                messages={messages}
                userId={user?.id || ''}
                hasMore={hasMore}
                onLoadMore={loadMoreMessages}
              />
            </ScrollArea>
          )}

          <div className="mt-4">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}