import { Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OnlineUsersProps {
  onlineUsers: Set<string>;
}

export function OnlineUsers({ onlineUsers }: OnlineUsersProps) {
  return (
    <div className="w-1/4 border-l">
      <div className="p-3 border-b">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Users className="h-4 w-4 mr-2" />
          Online
        </div>
      </div>
      <ScrollArea className="h-full">
        {Array.from(onlineUsers).map((userId) => (
          <div key={userId} className="p-3 text-sm">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2" />
              {userId}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}