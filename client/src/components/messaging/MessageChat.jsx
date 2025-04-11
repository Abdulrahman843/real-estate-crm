import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import websocketService from '../../services/websocketService';

const MessageChat = ({ selectedConversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/${selectedConversation._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      
      // Subscribe to new messages
      websocketService.subscribeToMessages((message) => {
        if (message.conversationId === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
          websocketService.markMessageRead(message._id, selectedConversation._id);
        }
      });

      // Subscribe to typing indicators
      websocketService.subscribeToTyping(({ userId, isTyping }) => {
        if (userId === selectedConversation.user._id) {
          setIsTyping(isTyping);
        }
      });

      // Subscribe to read receipts
      websocketService.subscribeToReadReceipts((data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, read: true } : msg
        ));
      });
    }

    return () => {
      websocketService.unsubscribeFromMessages();
    };
  }, [selectedConversation, fetchMessages]);

  useEffect(scrollToBottom, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    websocketService.emitTyping(selectedConversation._id);
    
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.emitTyping(selectedConversation._id, false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        receiver: selectedConversation._id,
        content: newMessage,
        propertyId: selectedConversation.property,
      };

      websocketService.sendMessage(messageData);
      setNewMessage('');
      
      // Optimistically add message to UI
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: selectedConversation.user._id,
        isSender: true,
        createdAt: new Date().toISOString(),
        pending: true
      };
      setMessages(prev => [...prev, optimisticMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message._id}
            sx={{
              display: 'flex',
              justifyContent: message.isSender ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            {!message.isSender && (
              <Avatar
                src={selectedConversation.user.avatar}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
            )}
            <Paper
              sx={{
                p: 2,
                bgcolor: message.isSender ? 'primary.main' : 'grey.200',
                color: message.isSender ? 'white' : 'text.primary',
                maxWidth: '70%',
                opacity: message.pending ? 0.7 : 1
              }}
            >
              <Typography>{message.content}</Typography>
              {message.read && message.isSender && (
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  Read
                </Typography>
              )}
            </Paper>
          </Box>
        ))}
        {isTyping && (
          <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
            {selectedConversation.user.name} is typing...
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <form onSubmit={handleSend} style={{ display: 'flex' }}>
          <TextField
            fullWidth
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
          />
          <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
            <SendIcon />
          </IconButton>
        </form>
      </Box>
    </Box>
  );
};

export default MessageChat;