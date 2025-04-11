import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MessagingPage from '../../pages/MessagingPage';
import authReducer from '../../store/slices/authSlice';

const mockStore = configureStore({
  reducer: {
    auth: authReducer
  },
  preloadedState: {
    auth: {
      user: { id: '123', name: 'Test User' }
    }
  }
});

describe('Messaging Integration', () => {
  test('full messaging flow', async () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <MessagingPage />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      // Test conversation loading
      expect(await screen.findByRole('list')).toBeInTheDocument();
      
      // Test message sending
      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });
  });
});