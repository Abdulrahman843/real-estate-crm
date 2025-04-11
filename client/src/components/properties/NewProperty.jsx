import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from '@mui/material';
import PropertyForm from '../../components/properties/PropertyForm';
import { propertyService } from '../../services/propertyService';

const NewProperty = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      await propertyService.createProperty(formData);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <PropertyForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Container>
  );
};

export default NewProperty;