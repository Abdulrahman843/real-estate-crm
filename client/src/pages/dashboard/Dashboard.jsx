import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { House, TrendingUp, Schedule } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    recentProperties: [],
    propertyStats: {
      totalViews: 0,
      totalInquiries: 0,
      activeListings: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <House color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Listings</Typography>
              </Box>
              <Typography variant="h3">{dashboardData.propertyStats.activeListings}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Views</Typography>
              </Box>
              <Typography variant="h3">{dashboardData.propertyStats.totalViews}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Inquiries</Typography>
              </Box>
              <Typography variant="h3">{dashboardData.propertyStats.totalInquiries}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Properties</Typography>
                <Button component={Link} to="/properties" color="primary">
                  View All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {dashboardData.recentProperties.map((property) => (
                  <Grid item xs={12} sm={6} md={4} key={property._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{property.title}</Typography>
                        <Typography color="textSecondary">${property.price}</Typography>
                        <Typography variant="body2">{property.location}</Typography>
                        <Button 
                          component={Link} 
                          to={`/properties/${property._id}`}
                          sx={{ mt: 1 }}
                          size="small"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;