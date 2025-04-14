import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const Forbidden = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
          mt: 10,
          p: 5,
          border: '2px solid #f44336',
          borderRadius: 3,
          bgcolor: '#fff5f5',
          boxShadow: 3
        }}
      >
        <ReportProblemIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />

        <Typography variant="h4" gutterBottom color="error">
          403 - Forbidden
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You are not authorized to access this resource.
        </Typography>

        <Button variant="contained" color="primary" component={Link} to="/">
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default Forbidden;
