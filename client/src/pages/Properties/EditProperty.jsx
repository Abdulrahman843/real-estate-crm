// real-estate-crm/client/src/pages/Properties/EditProperty.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Box, Paper, CircularProgress } from '@mui/material';
import PropertyForm from './PropertyForm';
import { propertyService } from '../../services/propertyService';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
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
      await propertyService.updateProperty(id, formData);
      navigate(`/properties/${id}`);
    } catch {
      setError('Failed to update property');
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
        <PropertyForm initialValues={property} onSubmit={handleSubmit} />
      </Paper>
    </Box>
  );
};

export default EditProperty;
