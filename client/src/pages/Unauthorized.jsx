import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
          mt: 10,
          p: 5,
          border: '2px dashed #e0e0e0',
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 2
        }}
      >
        <LockOutlined sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />

        <Typography variant="h4" gutterBottom color="text.primary">
          Unauthorized Access
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to view this page.
          <br />
          Please contact your administrator or return to a permitted area.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/dashboard"
          size="large"
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
