import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthProvider'
import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'

interface Chat {
  id: string
  name: string
  created_at: string
  created_by: string
  participants: {
    user_id: string
    user: {
      full_name: string
      avatar_url: string
    }
  }[]
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
}

export function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // First get the chat rooms where the user is a participant
        const { data: chatRooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select(`
            id,
            name,
            created_at,
            created_by,
            participants:chat_participants(
              user_id,
              user:user_profiles(
                full_name,
                avatar_url
              )
            ),
            last_message:chat_messages(
              content,
              created_at,
              sender_id
            )
          `)
          .order('created_at', { ascending: false });

        if (roomsError) {
          console.error('Error fetching chat rooms:', roomsError);
          throw roomsError;
        }

        setChats(chatRooms || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false)
      }
    };

    fetchChats();

    // Subscribe to chat room updates
    const roomsChannel = supabase
      .channel('chat-room-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `participants.user_id=eq.${user?.id}`
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('chat-message-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      roomsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No chats yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your chats will appear here once you start conversations with other users.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/chat/${chat.id}`}
          className="block hover:bg-gray-50"
        >
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium text-primary">
                {chat.name}
              </p>
              {chat.last_message && (
                <div className="ml-2 flex-shrink-0 text-sm text-gray-500">
                  {new Date(chat.last_message.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Participants: {chat.participants.map(participant => participant.user.full_name).join(', ')}
              </p>
              {chat.last_message && (
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {chat.last_message.content}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}