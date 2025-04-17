// client/src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Person,
  House,
  Assignment,
  TrendingUp
} from '@mui/icons-material';
import api from '../../services/api';
import useAuth from '../../contexts/useAuth';

/**
 * AdminDashboard Component
 * Displays key statistics for admin users: users, properties, listings, transactions
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Person fontSize="large" />,
      color: '#1976d2'
    },
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: <House fontSize="large" />,
      color: '#2e7d32'
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: <Assignment fontSize="large" />,
      color: '#ed6c02'
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: <TrendingUp fontSize="large" />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        bgcolor: card.color,
                        borderRadius: '50%',
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        color: '#fff'
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={600}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
