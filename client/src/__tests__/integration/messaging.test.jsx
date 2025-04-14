import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MessagingPage from '../../pages/MessagingPage';
import authReducer from '../../store/slices/authSlice';

// Mock Redux store with authenticated user
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

    // Wait for the conversation list to appear
    expect(await screen.findByRole('list')).toBeInTheDocument();

    // Find input and button
    const input = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Check if both are present
    expect(input).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();

    // Simulate typing and sending a message
    await act(async () => {
      await userEvent.type(input, 'Hello, this is a test message!');
      await userEvent.click(sendButton);
    });

    // Optionally check if the message appears in the DOM
    expect(await screen.findByText(/hello, this is a test message!/i)).toBeInTheDocument();
  });
});
