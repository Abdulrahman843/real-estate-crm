import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Paper } from '@mui/material';
import PropertyMap from '../../components/properties/PropertyMap';

const PropertyDetails = () => {
  const { id } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">Property Details</Typography>
            {/* Property information will be populated here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <PropertyMap properties={[]} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyDetails;