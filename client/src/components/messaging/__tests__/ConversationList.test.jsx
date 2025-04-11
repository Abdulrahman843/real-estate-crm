import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ConversationList from '../ConversationList';

jest.mock('axios');

const mockConversations = [
  {
    _id: '1',
    participant: {
      name: 'John Doe',
      avatar: 'avatar1.jpg'
    },
    lastMessage: {
      content: 'Hello there!',
      createdAt: new Date().toISOString()
    },
    unreadCount: 2
  },
  {
    _id: '2',
    user: {
      name: 'Jane Smith',
      avatar: 'avatar2.jpg'
    },
    lastMessage: {
      content: 'When can I view the property?',
      createdAt: new Date().toISOString()
    },
    unreadCount: 0
  }
];

describe('ConversationList', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<ConversationList selectedId="" onSelect={() => {}} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('renders conversations after successful API call', async () => {
    axios.get.mockResolvedValue({ data: mockConversations });
    render(<ConversationList selectedId="" onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
  });

  test('handles conversation selection', async () => {
    const mockOnSelect = jest.fn();
    axios.get.mockResolvedValue({ data: mockConversations });

    render(<ConversationList selectedId="" onSelect={mockOnSelect} />);

    await waitFor(() => {
      const firstConversation = screen.getByText('John Doe').closest('div[role="button"]');
      fireEvent.click(firstConversation);
      expect(mockOnSelect).toHaveBeenCalledWith(mockConversations[0]);
    });
  });

  test('displays unread message indicator correctly', async () => {
    axios.get.mockResolvedValue({ data: mockConversations });
    render(<ConversationList selectedId="" onSelect={() => {}} />);

    await waitFor(() => {
      const badges = document.querySelectorAll('.MuiBadge-badge');
      expect(badges[0]).toHaveClass('MuiBadge-dot');
      expect(badges[1]).toHaveClass('MuiBadge-invisible');
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API Error'));

    render(<ConversationList selectedId="" onSelect={() => {}} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});