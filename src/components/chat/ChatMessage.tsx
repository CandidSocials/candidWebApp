import { cn } from '@/lib/utils';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] p-3 rounded-lg",
        isOwnMessage
          ? "ml-auto bg-primary text-white"
          : "bg-gray-100"
      )}
    >
      {message.content}
    </div>
  );
}