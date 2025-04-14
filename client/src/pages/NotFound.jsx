import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// Optional image support:
// import NotFoundImage from '../assets/404.svg'; // if you have a 404 illustration

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />

        {/* Optional image preview */}
        {/* <Box component="img" src={NotFoundImage} alt="Not Found" sx={{ height: 200, mb: 3 }} /> */}

        <Typography variant="h1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          404
        </Typography>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
