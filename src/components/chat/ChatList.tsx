import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthProvider'
import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'

interface Chat {
  id: string
  job_application_id: string
  business_id: string
  freelancer_id: string
  other_user: {
    full_name: string
  }
  job_listing: {
    title: string
  }
  last_message?: {
    content: string
    created_at: string
  }
}

export function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
    
    // Subscribe to new chats
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `business_id=eq.${user?.id},freelancer_id=eq.${user?.id}`,
        },
        () => {
          fetchChats()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const fetchChats = async () => {
    try {
      const { data: chatsData } = await supabase
        .from('chats')
        .select(`
          *,
          job_application:job_applications (
            job:job_listings (
              title
            )
          ),
          business:business_id (
            profile:user_profiles (
              full_name
            )
          ),
          freelancer:freelancer_id (
            profile:user_profiles (
              full_name
            )
          )
        `)
        .or(`business_id.eq.${user?.id},freelancer_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (chatsData) {
        const formattedChats = chatsData.map(chat => ({
          ...chat,
          other_user: user?.id === chat.business_id
            ? chat.freelancer.profile
            : chat.business.profile,
          job_listing: chat.job_application.job
        }))

        // Fetch last message for each chat
        const chatsWithLastMessage = await Promise.all(
          formattedChats.map(async chat => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('content, created_at')
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            return {
              ...chat,
              last_message: messages
            }
          })
        )

        setChats(chatsWithLastMessage)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

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
                {chat.other_user.full_name}
              </p>
              {chat.last_message && (
                <div className="ml-2 flex-shrink-0 text-sm text-gray-500">
                  {new Date(chat.last_message.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Re: {chat.job_listing.title}
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