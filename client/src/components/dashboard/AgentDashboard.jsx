import { Grid, Typography, Paper } from '@mui/material';
import { House, TrendingUp, Email } from '@mui/icons-material';
import StatCard from './StatCard';

const AgentDashboard = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><Typography variant="h5">Agent Overview</Typography></Grid>
      <Grid item xs={12} sm={4}><StatCard title="Active Listings" value={data.activeListings?.length || 0} icon={<House />} /></Grid>
      <Grid item xs={12} sm={4}><StatCard title="Total Views" value={data.totalViews || 0} icon={<TrendingUp />} /></Grid>
      <Grid item xs={12} sm={4}><StatCard title="Inquiries" value={data.totalInquiries || 0} icon={<Email />} /></Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Recent Listings</Typography>
          {data.recentListings?.length > 0 ? data.recentListings.map((prop, idx) => (
            <Typography key={idx} variant="body2">{prop.title} - £{prop.price}</Typography>
          )) : <Typography>No recent listings</Typography>}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AgentDashboard;