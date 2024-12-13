import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatRoom } from './types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  currentRoom: string | null;
  userId: string;
  onRoomSelect: (roomId: string) => void;
}

export function ChatRoomList({ rooms, currentRoom, userId, onRoomSelect }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        No chats yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {rooms.map((room) => {
          const otherParticipants = room.participants
            .filter((p) => p.user_id !== userId)
            .map((p) => p.profile.full_name)
            .join(', ');

          return (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={cn(
                "w-full p-4 text-left hover:bg-gray-50 transition-colors",
                currentRoom === room.id && "bg-gray-100"
              )}
            >
              <div className="font-medium text-gray-900 truncate">
                {room.name || otherParticipants}
              </div>
              <div className="mt-1 flex justify-between items-center">
                <span className="text-sm text-gray-500 truncate">
                  {otherParticipants}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(room.updated_at)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}