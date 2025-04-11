import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import PropertyForm from '../../components/properties/PropertyForm';
import { propertyService } from '../../services/propertyService';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch property');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      await propertyService.updateProperty(id, formData);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update property');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PropertyForm
        initialData={property}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Container>
  );
};

export default EditProperty;