import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { LineChart, PieChart } from '@mui/x-charts';

const PropertyAnalytics = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Property Views Trend</Typography>
          <LineChart
            series={[{ data: data.viewsTrend, label: 'Views' }]}
            xAxis={[{ scaleType: 'band', dataKey: 'x' }]}
            height={300}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Property Types Distribution</Typography>
          <PieChart
            series={[{ data: data.propertyTypes }]}
            height={300}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PropertyAnalytics;
