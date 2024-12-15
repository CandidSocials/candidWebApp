import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djjlszpgmrcbgtizptfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamxzenBnbXJjYmd0aXpwdGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NDM5MTQsImV4cCI6MjA0OTQxOTkxNH0.wX8Sg_l0mL8DDt0C5GoxIw0JaALe88hlGkAEQso0CeU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        // Check messages table
        console.log('\nChecking messages table:');
        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);
        
        if (messagesError) {
            console.error('Error accessing messages table:', messagesError);
        } else {
            console.log('Messages table exists with structure:', messages);
        }

        // Check chat_messages table
        console.log('\nChecking chat_messages table:');
        const { data: chatMessages, error: chatMessagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .limit(1);
        
        if (chatMessagesError) {
            console.error('Error accessing chat_messages table:', chatMessagesError);
        } else {
            console.log('Chat_messages table exists with structure:', chatMessages);
        }

        // Check chat_rooms table
        console.log('\nChecking chat_rooms table:');
        const { data: chatRooms, error: chatRoomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .limit(1);
        
        if (chatRoomsError) {
            console.error('Error accessing chat_rooms table:', chatRoomsError);
        } else {
            console.log('Chat_rooms table exists with structure:', chatRooms);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
