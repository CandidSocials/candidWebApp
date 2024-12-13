import { Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatParticipant } from '@/services/types/chat.types';

interface OnlineUsersProps {
  users: ChatParticipant[];
  isLoading?: boolean;
}

export function OnlineUsers({ users = [], isLoading = false }: OnlineUsersProps) {
  if (isLoading) {
    return (
      <div className="w-64 border-l">
        <div className="p-3 border-b">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Users className="h-4 w-4 mr-2" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l">
      <div className="p-3 border-b">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Users className="h-4 w-4 mr-2" />
          Online Users ({users.length})
        </div>
      </div>
      <ScrollArea className="h-full">
        {users.length === 0 ? (
          <div className="p-3 text-sm text-gray-500">
            No users online
          </div>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="p-3 hover:bg-gray-50">
              <div className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.profile.full_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.last_seen || '').toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}