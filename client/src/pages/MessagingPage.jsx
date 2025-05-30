import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import useAuth from '../contexts/useAuth';
import websocketService from '../services/websocketService';
import api from '../services/api';

import ConversationList from '../components/messaging/ConversationList';
import MessageChat from '../components/messaging/MessageChat';

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { conversationId } = useParams();
  const { user } = useAuth();

  // Initialize socket & fetch conversations
  useEffect(() => {
    if (user?.id) {
      websocketService.connect(user.id);
      fetchConversations();
    }

    return () => websocketService.disconnect();
  }, [user]);

  // Highlight selected conversation
  useEffect(() => {
    if (conversationId && conversations.length) {
      const convo = conversations.find(c => c._id === conversationId);
      if (convo) {
        setSelectedConversation(convo);
      }
    }
  }, [conversationId, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Sidebar */}
        <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <Paper sx={{ height: '100%', borderRadius: 0 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Messages</Typography>
            </Box>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?._id}
              onSelect={handleSelectConversation}
            />
          </Paper>
        </Grid>

        {/* Chat */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', borderRadius: 0 }}>
            {selectedConversation ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {selectedConversation.user?.name || 'User'}
                  </Typography>
                  {selectedConversation.property && (
                    <Typography variant="body2" color="text.secondary">
                      Regarding: {selectedConversation.property.title}
                    </Typography>
                  )}
                </Box>
                <MessageChat selectedConversation={selectedConversation} />
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessagingPage;
