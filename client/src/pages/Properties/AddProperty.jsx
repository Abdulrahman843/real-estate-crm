import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import PropertyForm from '../../components/properties/PropertyForm';

const AddProperty = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Add New Property
        </Typography>
        <PropertyForm />
      </Paper>
    </Box>
  );
};

export default AddProperty;