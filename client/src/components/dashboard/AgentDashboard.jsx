import { Grid, Typography, Paper } from '@mui/material';
import { House, TrendingUp, Email } from '@mui/icons-material';
import StatCard from './StatCard';

const AgentDashboard = ({ data }) => {
  const activeListings = data.activeListings?.length || 0;
  const totalViews = data.totalViews || 0;
  const totalInquiries = data.totalInquiries || 0;
  const recentListings = data.recentListings || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Agent Overview</Typography>
      </Grid>

      <Grid item xs={12} sm={4}>
        <StatCard title="Active Listings" value={activeListings} icon={<House />} />
      </Grid>

      <Grid item xs={12} sm={4}>
        <StatCard title="Total Views" value={totalViews} icon={<TrendingUp />} />
      </Grid>

      <Grid item xs={12} sm={4}>
        <StatCard title="Inquiries" value={totalInquiries} icon={<Email />} />
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Listings</Typography>
          {recentListings.length > 0 ? (
            recentListings.map((prop, idx) => (
              <Typography key={idx} variant="body2">
                {prop.title} - £{prop.price.toLocaleString()}
              </Typography>
            ))
          ) : (
            <Typography>No recent listings</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AgentDashboard;
