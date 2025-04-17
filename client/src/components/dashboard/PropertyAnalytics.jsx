// client/src/components/dashboard/PropertyAnalytics.jsx

import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { LineChart, PieChart } from '@mui/x-charts';

/**
 * PropertyAnalytics Component
 * Displays analytics charts for property views trend and property type distribution.
 *
 * @param {Object} data - The analytics data object
 * @param {Array<{ x: string, y: number }>} data.viewsTrend - Monthly property views
 * @param {Array<{ id: string, value: number, label: string }>} data.propertyTypes - Distribution of property types
 */
const PropertyAnalytics = ({ data }) => {
  if (!data || !data.viewsTrend || !data.propertyTypes) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No analytics data available.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* Views Trend Line Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 360 }}>
          <Typography variant="h6" gutterBottom>
            Property Views Trend
          </Typography>
          <LineChart
            xAxis={[
              {
                scaleType: 'band',
                dataKey: 'x',
                label: 'Month',
              }
            ]}
            series={[
              {
                data: data.viewsTrend.map(item => item.y),
                label: 'Views',
                color: '#1976d2',
              }
            ]}
            width={500}
            height={260}
            margin={{ left: 30, right: 20, top: 30, bottom: 20 }}
          />
        </Paper>
      </Grid>

      {/* Property Types Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 360 }}>
          <Typography variant="h6" gutterBottom>
            Property Types Distribution
          </Typography>
          <PieChart
            series={[
              {
                data: data.propertyTypes.map(type => ({
                  id: type.id,
                  value: type.value,
                  label: type.label,
                })),
              },
            ]}
            width={500}
            height={260}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PropertyAnalytics;
