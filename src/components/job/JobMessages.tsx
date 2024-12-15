import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../lib/AuthProvider';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobMessagesProps {
  jobId: string;
  otherUserId: string;
  otherUserName: string;
}

export function JobMessages({ jobId, otherUserId, otherUserName }: JobMessagesProps) {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useMessages(jobId, otherUserId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">
          Error cargando mensajes: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p={2} bgcolor="primary.main" color="primary.contrastText">
        <Typography variant="h6">
          Chat with {otherUserName}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        flex={1}
        p={2}
        sx={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.sender_id === user?.id ? 'flex-end' : 'flex-start'}
            sx={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: message.sender_id === user?.id ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            <Avatar
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: message.sender_id === user?.id ? 'primary.main' : 'secondary.main'
              }}
            >
              {message.sender?.full_name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: message.sender_id === user?.id ? 'primary.main' : 'grey.100',
                  color: message.sender_id === user?.id ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          multiline
          maxRows={4}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!newMessage.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
}
