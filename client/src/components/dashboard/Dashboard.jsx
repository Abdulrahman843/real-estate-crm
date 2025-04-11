import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Box, CircularProgress, Paper, List, ListItem,
  ListItemText
} from '@mui/material';
import { propertyService } from '../../services/propertyService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await propertyService.getDashboardStats();
        setStats(data || {}); // fallback to empty object
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({}); // fallback in error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="h4">
                {stats?.totalProperties || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                ${stats?.totalValue?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Listings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Listings
            </Typography>
            <List>
              {(stats?.recentListings || []).map((listing) => (
                <ListItem key={listing._id || listing.id}>
                  <ListItemText
                    primary={listing.title || 'Untitled'}
                    secondary={`$${listing.price?.toLocaleString() || 0}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Property Types Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Property Types Distribution
            </Typography>
            {/* Optional chart goes here */}
          </Paper>
        </Grid>

        {/* Monthly Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Performance
            </Typography>
            {/* Optional chart goes here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
