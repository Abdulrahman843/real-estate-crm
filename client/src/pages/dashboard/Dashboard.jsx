// real-estate-crm/client/src/pages/dashboard/Dashboard.jsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { propertyService } from '../../services/propertyService';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import AgentDashboard from '../../components/dashboard/AgentDashboard';
import ClientDashboard from '../../components/dashboard/ClientDashboard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [dashboardType, setDashboardType] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await propertyService.getDashboardStats();

        if (res.totalProperties !== undefined) {
          setDashboardType(res.dashboardType || 'admin');
        } else if (res.propertyStats) {
          setDashboardType('agent');
        } else {
          setDashboardType('client');
        }

        setData(res);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data.');
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box px={3} py={4}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight={600}>
          Welcome to your <Chip label={dashboardType.toUpperCase()} color="primary" /> dashboard
        </Typography>
        <Tooltip title="Profile">
          <Avatar alt="User Avatar" src="/default-avatar.png" sx={{ width: 48, height: 48 }} />
        </Tooltip>
      </Box>

      {dashboardType === 'admin' && <AdminDashboard data={data} />}
      {dashboardType === 'agent' && <AgentDashboard data={data} />}
      {dashboardType === 'client' && <ClientDashboard data={data} />}
    </Box>
  );
};

export default Dashboard;
