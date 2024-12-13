import { supabase } from '@/lib/supabase';
import { ChatMessage, Chat } from './types';

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages_with_profiles')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(chatId: string, senderId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert([{
      chat_id: chatId,
      sender_id: senderId,
      content: content.trim()
    }]);

  if (error) throw error;
}

export async function fetchChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chat_rooms_with_details')
    .select('*')
    .or(`business_id.eq.${userId},freelancer_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createChat(
  jobApplicationId: string,
  businessId: string,
  freelancerId: string
): Promise<Chat> {
  // First check if chat already exists
  const { data: existingChat } = await supabase
    .from('chats')
    .select('*')
    .eq('job_application_id', jobApplicationId)
    .single();

  if (existingChat) {
    return existingChat;
  }

  // Create new chat if none exists
  const { data, error } = await supabase
    .from('chats')
    .insert([{
      job_application_id: jobApplicationId,
      business_id: businessId,
      freelancer_id: freelancerId
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create chat');
  return data;
}