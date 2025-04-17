// real-estate-crm/client/src/pages/Properties/EditProperty.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Box, Paper, CircularProgress, Snackbar, Alert
} from '@mui/material';
import PropertyForm from './PropertyForm';
import { propertyService } from '../../services/propertyService';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await propertyService.getPropertyById(id);
        setProperty(response); // Make sure this matches the response shape
      } catch {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const formDataToSend = new FormData();
      formData.images?.forEach((file) => {
        formDataToSend.append('images', file);
      });
      formDataToSend.append('data', JSON.stringify(formData));

      await propertyService.updateProperty(id, formDataToSend);

      setSnackbar({ open: true, message: 'Property updated successfully!', severity: 'success' });
      setTimeout(() => navigate(`/properties/${id}`), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error?.response?.data?.message || 'Failed to update property', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Edit Property</Typography>
      <Paper sx={{ p: 3 }}>
        <PropertyForm initialValues={property} onSubmit={handleSubmit} isEdit />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProperty;
