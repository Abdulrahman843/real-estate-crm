// real-estate-crm/client/src/pages/dashboard/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Avatar, CircularProgress } from '@mui/material';
import { propertyService } from '../../services/propertyService';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import AgentDashboard from '../../components/dashboard/AgentDashboard';
import ClientDashboard from '../../components/dashboard/ClientDashboard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [dashboardType, setDashboardType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
      }
    };
    fetchData();
  }, []);

  if (!data) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          Welcome <Chip label={dashboardType.toUpperCase()} color="primary" />
        </Typography>
        <Avatar alt="User" src="/default-avatar.png" />
      </Box>

      {dashboardType === 'admin' && <AdminDashboard data={data} />}
      {dashboardType === 'agent' && <AgentDashboard data={data} />}
      {dashboardType === 'client' && <ClientDashboard data={data} />}
    </Box>
  );
};

export default Dashboard;
