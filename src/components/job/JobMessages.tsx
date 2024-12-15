import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { useMessages } from '@/hooks/useMessages';
import { Box, Paper, TextField, IconButton, Typography, Avatar, Alert, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface JobMessagesProps {
  jobId: string;
  otherUserId: string;
  otherUserName: string;
}

export function JobMessages({ jobId, otherUserId, otherUserName }: JobMessagesProps) {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useMessages(otherUserId, jobId);
  const [newMessage, setNewMessage] = useState('');
  const [sendError, setSendError] = useState('');
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
      setSendError('');
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setSendError('Failed to send message. Please try again.');
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
          Error loading messages: {error.message}
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
              {message.sender_profile?.full_name?.[0]?.toUpperCase() || '?'}
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

      {/* Error Message */}
      {sendError && (
        <Box px={2}>
          <Alert severity="error" onClose={() => setSendError('')}>
            {sendError}
          </Alert>
        </Box>
      )}

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
          placeholder="Write a message..."
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
