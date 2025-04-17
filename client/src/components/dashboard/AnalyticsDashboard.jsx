// client/src/components/dashboard/AnalyticsDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

/**
 * AnalyticsDashboard Component
 * Displays summary stats and trends for property views and inquiries.
 */
const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    propertyViews: [],
    inquiries: [],
    totalProperties: 0,
    activeListings: 0,
    totalInquiries: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics/dashboard');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
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

  const summaryCards = [
    { label: 'Total Properties', value: analytics.totalProperties },
    { label: 'Active Listings', value: analytics.activeListings },
    { label: 'Total Inquiries', value: analytics.totalInquiries },
    { label: 'Conversion Rate', value: `${analytics.conversionRate}%` },
  ];

  const ChartSection = ({ title, data, dataKey, strokeColor }) => (
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={strokeColor} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      {summaryCards.map((item, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{item.label}</Typography>
              <Typography variant="h4">{item.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Line Charts */}
      <ChartSection
        title="Property Views Trend"
        data={analytics.propertyViews}
        dataKey="views"
        strokeColor="#8884d8"
      />
      <ChartSection
        title="Inquiries Trend"
        data={analytics.inquiries}
        dataKey="count"
        strokeColor="#82ca9d"
      />
    </Grid>
  );
};

export default AnalyticsDashboard;
