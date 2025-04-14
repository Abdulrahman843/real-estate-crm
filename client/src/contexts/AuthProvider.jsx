import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import authService from '../services/authService';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
  const initAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  initAuth();
}, []);

const login = async (credentials) => {
  const { token, user } = await authService.login(credentials);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setUser(user);
  navigate('/');
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/login');
};

const value = {
  user,
  loading,
  login,
  logout,
  isAuthenticated: !!user,
  isAdmin: () => user?.role === 'admin',
};

if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider }; // Named export
export default AuthProvider;
