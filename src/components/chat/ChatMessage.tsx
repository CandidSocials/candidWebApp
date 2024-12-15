import { cn } from '@/lib/utils';
import { Message } from './types';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1",
      isOwnMessage ? "items-end" : "items-start"
    )}>
      <div className="text-xs text-gray-500">
        {message.sender_profile?.full_name || 'Unknown'} • {format(new Date(message.created_at), 'HH:mm')}
      </div>
      <div
        className={cn(
          "max-w-[80%] p-3 rounded-lg",
          isOwnMessage
            ? "bg-primary text-white"
            : "bg-gray-100"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}