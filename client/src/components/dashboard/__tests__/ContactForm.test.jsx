import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '../ContactForm';
import axios from 'axios';
import useAuth from '../../../contexts/useAuth';

// Mock axios and useAuth
jest.mock('axios');
jest.mock('../../../contexts/useAuth');

describe('ContactForm Component', () => {
  const mockUser = {
    email: 'testuser@example.com',
    phone: '1234567890'
  };

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
  });

  it('renders form inputs with user data', () => {
    render(<ContactForm propertyId="123" agentId="456" />);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/phone/i)).toHaveValue(mockUser.phone);
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    axios.post.mockResolvedValueOnce({});

    render(<ContactForm propertyId="123" agentId="456" />);

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Hello Agent' }
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() =>
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
    );
  });

  it('displays error on failed submit', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to send message' } }
    });

    render(<ContactForm propertyId="123" agentId="456" />);

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Hello Agent' }
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() =>
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    );
  });
});
