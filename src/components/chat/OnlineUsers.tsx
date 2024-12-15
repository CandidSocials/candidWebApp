import { cn } from '@/lib/utils';
import { User } from '@/types';

interface OnlineUsersProps {
  onlineUsers: User[];
  selectedUserId?: string | null;
  onUserSelect?: (userId: string) => void;
}

export function OnlineUsers({ onlineUsers, selectedUserId, onUserSelect }: OnlineUsersProps) {
  if (!onlineUsers || onlineUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <p>No users online</p>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Online Users</h2>
      </div>
      <div className="divide-y">
        {onlineUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect?.(user.id)}
            className={cn(
              "w-full p-4 text-left hover:bg-gray-50 flex items-center space-x-3",
              selectedUserId === user.id && "bg-gray-100"
            )}
          >
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {getInitials(user.full_name)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.full_name || 'Anonymous User'}</div>
              {user.title && (
                <div className="text-sm text-gray-500">{user.title}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}