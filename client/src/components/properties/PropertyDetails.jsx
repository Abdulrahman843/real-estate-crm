import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Grid, Typography, Paper, Chip, Button,
  CircularProgress, Alert, ImageList, ImageListItem, Divider,
  TextField, useTheme, useMediaQuery
} from '@mui/material';
import {
  LocationOn, Home, Hotel, Bathtub, SquareFoot,
  Edit, Delete, ArrowBack
} from '@mui/icons-material';
import { propertyService } from '../../services/propertyService';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(id);
        navigate('/properties');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete property');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!property) return <Alert severity="info">Property not found</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/properties')}
          sx={{ mb: 2 }}
        >
          Back to Properties
        </Button>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>{property.title}</Typography>
                <Box>
                  <Button startIcon={<Edit />} onClick={() => navigate(`/properties/edit/${id}`)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button startIcon={<Delete />} color="error" onClick={handleDelete}>
                    Delete
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <ImageList sx={{ height: isMobile ? 300 : 450 }} cols={isMobile ? 1 : 2} variant="quilted">
                {property.images.map((image, index) => (
                  <ImageListItem
                    key={index}
                    onClick={() => {
                      setLightboxIndex(index);
                      setIsLightboxOpen(true);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <img src={image} alt={`Property ${index + 1}`} loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>

            {/* Price and Location */}
            <Grid item xs={12}>
              <Typography variant="h4" color="primary" gutterBottom>
                ${property.price.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="action" />
                <Typography variant="h6">{property.location}</Typography>
              </Box>
            </Grid>

            {/* Google Maps */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Map Preview</Typography>
                <iframe
                  title="property-map"
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0 }}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                  allowFullScreen
                ></iframe>
              </Box>
            </Grid>

            {/* Property Details */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip icon={<Home />} label={property.propertyType} />
                <Chip icon={<SquareFoot />} label={`${property.area} sq ft`} />
                <Chip icon={<Hotel />} label={`${property.bedrooms} Beds`} />
                <Chip icon={<Bathtub />} label={`${property.bathrooms} Baths`} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>{property.description}</Typography>
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Amenities</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {property.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} />
                ))}
              </Box>
            </Grid>

            {/* Comments */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Comments</Typography>
              <Box component="form" onSubmit={(e) => {
                e.preventDefault();
                if (newComment.trim()) {
                  setComments([...comments, newComment]);
                  setNewComment('');
                }
              }}>
                <TextField
                  fullWidth
                  label="Leave a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained">Post Comment</Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                {comments.map((comment, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1 }}>
                    <Typography>{comment}</Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {isLightboxOpen && (
          <Lightbox
            mainSrc={property.images[lightboxIndex]}
            nextSrc={property.images[(lightboxIndex + 1) % property.images.length]}
            prevSrc={property.images[(lightboxIndex + property.images.length - 1) % property.images.length]}
            onCloseRequest={() => setIsLightboxOpen(false)}
            onMovePrevRequest={() =>
              setLightboxIndex((lightboxIndex + property.images.length - 1) % property.images.length)
            }
            onMoveNextRequest={() =>
              setLightboxIndex((lightboxIndex + 1) % property.images.length)
            }
          />
        )}
      </Box>
    </Container>
  );
};

export default PropertyDetails;
