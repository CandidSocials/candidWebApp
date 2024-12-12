import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Message } from '../types'
import { useAuth } from '@/lib/AuthProvider'

export function useMessages(chatId: string) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    const unsubscribe = subscribeToMessages()
    return () => {
      unsubscribe()
    }
  }, [chatId])

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('chat_messages_with_sender')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
        await markMessagesAsRead(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (messages: Message[]) => {
    const unreadMessages = messages.filter(
      msg => !msg.read && msg.sender_id !== user?.id
    )

    if (unreadMessages.length > 0) {
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .in('id', unreadMessages.map(msg => msg.id))
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return

    try {
      await supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: user.id,
            content: content.trim(),
          },
        ])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return {
    messages,
    loading,
    sendMessage
  }
}