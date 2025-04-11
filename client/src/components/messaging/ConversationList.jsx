import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Badge
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ selectedId, onSelect }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {conversations.map((conversation) => (
        <React.Fragment key={conversation._id}>
          <ListItem
            alignItems="flex-start"
            button
            selected={selectedId === conversation._id}
            onClick={() => onSelect(conversation)}
          >
            <ListItemAvatar>
              <Badge
                color="primary"
                variant="dot"
                invisible={!conversation.unreadCount}
              >
                <Avatar
                  alt={conversation.participant?.name || conversation.user?.name}
                  src={conversation.participant?.avatar || conversation.user?.avatar}
                />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={conversation.participant?.name || conversation.user?.name}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {conversation.lastMessage?.content?.substring(0, 30)}
                    {conversation.lastMessage?.content?.length > 30 ? '...' : ''}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {conversation.lastMessage?.createdAt &&
                      formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default ConversationList;
