import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const ContactForm = ({ propertyId, agentId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    message: '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/contact', {
        ...formData,
        propertyId,
        agentId
      });
      setSuccess(true);
      setFormData({ ...formData, message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Contact Agent
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Message sent successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          margin="normal"
          required
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Message'}
        </Button>
      </form>
    </Paper>
  );
};

export default ContactForm;