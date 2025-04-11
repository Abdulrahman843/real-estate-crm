import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Person, House, Assignment, TrendingUp } from '@mui/icons-material';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <Person />, color: '#1976d2' },
    { title: 'Total Properties', value: stats.totalProperties, icon: <House />, color: '#2e7d32' },
    { title: 'Active Listings', value: stats.activeListings, icon: <Assignment />, color: '#ed6c02' },
    { title: 'Total Transactions', value: stats.totalTransactions, icon: <TrendingUp />, color: '#9c27b0' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    backgroundColor: card.color,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    color: 'white'
                  }}>
                    {card.icon}
                  </Box>
                  <Typography color="textSecondary" variant="h6">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;