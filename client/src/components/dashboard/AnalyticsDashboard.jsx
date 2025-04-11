import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    propertyViews: [],
    inquiries: [],
    totalProperties: 0,
    activeListings: 0,
    totalInquiries: 0,
    conversionRate: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/analytics/dashboard');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Properties
            </Typography>
            <Typography variant="h4">
              {analytics.totalProperties}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Listings
            </Typography>
            <Typography variant="h4">
              {analytics.activeListings}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Inquiries
            </Typography>
            <Typography variant="h4">
              {analytics.totalInquiries}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Conversion Rate
            </Typography>
            <Typography variant="h4">
              {analytics.conversionRate}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Property Views Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.propertyViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Inquiries Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.inquiries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;