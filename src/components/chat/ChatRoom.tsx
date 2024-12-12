import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthProvider'
import { Send } from 'lucide-react'

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
  sender_full_name: string
}

interface ChatInfo {
  title: string
  otherUser: string
}

export function ChatRoom() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatInfo, setInfo] = useState<ChatInfo | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (chatId && user) {
      fetchMessages()
      fetchChatInfo()
      const unsubscribe = subscribeToMessages()
      return () => {
        unsubscribe()
      }
    }
  }, [chatId, user])

  /* const fetchChatInfo = async () => {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .select(`
          job_application:job_applications (
            job:job_listings (
              title
            )
          ),
          business:business_id (
            profile:user_profiles!inner (
              full_name,
              user_id
            )
          ),
          freelancer:freelancer_id (
            profile:user_profiles!inner (
              full_name,
              user_id
            )
          )
        `)
        .eq('id', chatId)
        .single()

      if (error) throw error

      if (chat) {
        const otherUser = user?.id === chat.business.profile.user_id
          ? chat.freelancer.profile.full_name
          : chat.business.profile.full_name

        setInfo({
          title: chat.job_application.job.title,
          otherUser
        })
      }
    } catch (err) {
      console.error('Error fetching chat info:', err)
      setError('Error loading chat information')
    }
  } */

    const fetchChatInfo = async () => {
      try {
        // First, get the chat details
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .select(`
            id,
            business_id,
            freelancer_id,
            job_applications (
              job_listings (
                title
              )
            )
          `)
          .eq('id', chatId)
          .single()
    
        if (chatError) throw chatError
    
        if (chat) {
          // Then fetch the business and freelancer profiles separately
          const { data: businessProfile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', chat.business_id)
            .single()
    
          const { data: freelancerProfile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', chat.freelancer_id)
            .single()
    
          const otherUser = user?.id === chat.business_id
            ? freelancerProfile?.full_name
            : businessProfile?.full_name
    
          setInfo({
            title: chat.job_applications?.[0]?.job_listings?.[0]?.title,
            otherUser: otherUser || 'Unknown User'
          })
        }
      } catch (err) {
        console.error('Error fetching chat info:', err)
        setError('Error loading chat information')
      }
    }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages_with_sender')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        setMessages(data)
        scrollToBottom()
        await markMessagesAsRead(data)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Error loading messages')
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (messages: Message[]) => {
    const unreadMessages = messages.filter(
      msg => !msg.read && msg.sender_id !== user?.id
    )

    if (unreadMessages.length > 0) {
      try {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadMessages.map(msg => msg.id))
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: user.id,
            content: newMessage.trim(),
          },
        ])

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {chatInfo?.title}
          </h2>
          <p className="text-sm text-gray-500">
            Chatting with {chatInfo?.otherUser}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {message.sender_full_name}
                </p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}