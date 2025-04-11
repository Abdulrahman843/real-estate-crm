import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authService = {
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    // This format matches what AuthContext.jsx expects
    return {
      token: response.data.token,
      user: {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      }
    };
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    return {
      token: response.data.token,
      user: {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      }
    };
  }
};

export default authService;
