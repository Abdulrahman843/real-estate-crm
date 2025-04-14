import { Grid, Typography, Paper } from '@mui/material';
import { House, AttachMoney, TrendingUp, Group } from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import StatCard from './StatCard';

const AdminDashboard = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><Typography variant="h5">Admin Overview</Typography></Grid>
      <Grid item xs={12} sm={6} md={3}><StatCard title="Total Properties" value={data.totalProperties} icon={<House />} /></Grid>
      <Grid item xs={12} sm={6} md={3}><StatCard title="Total Value" value={`£${data.totalValue?.toLocaleString()}`} icon={<AttachMoney />} /></Grid>
      <Grid item xs={12} sm={6} md={3}><StatCard title="Recent Listings" value={data.recentListings?.length || 0} icon={<TrendingUp />} /></Grid>
      <Grid item xs={12} sm={6} md={3}><StatCard title="Active Listings" value={data.activeListings?.length || 0} icon={<Group />} /></Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Monthly Performance</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
              <Line type="monotone" dataKey="inquiries" stroke="#82ca9d" name="Inquiries" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;