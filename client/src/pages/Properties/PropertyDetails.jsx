import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Button,
  ImageList,
  ImageListItem,
  Stack
} from '@mui/material';
import PropertyMap from '../../components/properties/PropertyMap';
import { propertyService } from '../../services/propertyService';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Property not found.</Typography>
      </Box>
    );
  }

  const { title, description, price, type, location, features, images = [], status } = property;
  const coverImage = images.find(img => img.label === 'cover');
  const galleryImages = images.filter(img => img.label !== 'cover');

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>{title}</Typography>
            <Typography variant="h5" color="primary" gutterBottom>£{price.toLocaleString()}</Typography>
            <Chip label={status?.toUpperCase() || 'AVAILABLE'} color="success" sx={{ mb: 1 }} />
            <Typography variant="body1" paragraph>{description}</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography variant="subtitle1">Type: {type}</Typography>
              <Typography variant="subtitle1">
                Location: {location?.address}, {location?.city}, {location?.state}, {location?.zipCode}
              </Typography>
              <Typography variant="subtitle1">Bedrooms: {features?.bedrooms || 0}</Typography>
              <Typography variant="subtitle1">Bathrooms: {features?.bathrooms || 0}</Typography>
              <Typography variant="subtitle1">Square Feet: {features?.squareFeet || 'N/A'}</Typography>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Amenities:</Typography>
              {features?.amenities?.length ? (
                features.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} sx={{ mr: 1, mt: 1 }} />
                ))
              ) : (
                <Typography variant="body2">No amenities listed</Typography>
              )}
            </Box>
          </Paper>

          {galleryImages.length > 0 && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Gallery</Typography>
              <ImageList cols={3} rowHeight={160}>
                {galleryImages.map((img, i) => (
                  <ImageListItem key={i}>
                    <img
                      src={img.thumbnail || img.url}
                      alt={`Gallery Image ${i + 1}`}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {coverImage && (
            <Paper sx={{ mb: 3, p: 1 }}>
              <img
                src={coverImage.thumbnail || coverImage.url}
                alt="Cover"
                style={{ width: '100%', height: 'auto', borderRadius: 8 }}
              />
              <Typography align="center" variant="caption" sx={{ mt: 1, display: 'block' }}>
                Cover Photo
              </Typography>
            </Paper>
          )}
          <PropertyMap properties={[property]} />
          <Box mt={2}>
            <Button variant="contained" color="primary" fullWidth>
              Contact Agent
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyDetails;