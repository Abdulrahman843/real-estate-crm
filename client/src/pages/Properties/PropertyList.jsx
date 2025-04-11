import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import {
  Snackbar, Alert, Box, Grid, Card, CardMedia, CardContent, Typography,
  Button, IconButton, FormControl, InputLabel, Select,
  MenuItem, Pagination, ToggleButton, ToggleButtonGroup, CircularProgress
} from '@mui/material';
import {
  Favorite, FavoriteBorder, GridView, List,
  Share, LocationOn, Hotel, BatchPrediction
} from '@mui/icons-material';

const PropertyList = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          sortBy,
          ...Object.fromEntries(searchParams)
        };
        const data = await propertyService.getProperties(params);
        setProperties(data.properties);
        setTotalPages(Math.ceil(data.total / 12));
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch properties',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, page, sortBy]);

  const handleFavorite = async (propertyId) => {
    try {
      await propertyService.toggleFavorite(propertyId);
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p));
      setSnackbar({ open: true, message: 'Property favorite status updated', severity: 'success' });
    } catch (error) {
        console.error('Failed to update favorite status:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update favorite status',
          severity: 'error'
        });
      }
  }
  const handleShare = (property) => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} - ${property.price.toLocaleString()}`,
      url: window.location.origin + `/properties/${property.id}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => copyToClipboard(shareData.url));
    } else {
      copyToClipboard(shareData.url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' }))
      .catch(() => setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' }));
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Filters and Controls */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup value={viewMode} exclusive onChange={(e, value) => value && setViewMode(value)}>
              <ToggleButton value="grid"><GridView /></ToggleButton>
              <ToggleButton value="list"><List /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Property Grid */}
          {properties.length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: 'center', py: 3 }}>
              No properties found
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={property.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height={viewMode === 'grid' ? 200 : 300}
                      image={property.imageUrl}
                      alt={property.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{property.title}</Typography>
                      <Typography variant="h5" color="primary" gutterBottom>
                        ${property.price.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1 }} color="action" />
                        <Typography variant="body2">{property.location}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Hotel sx={{ mr: 0.5 }} color="action" />
                          <Typography variant="body2">{property.bedrooms} Beds</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BatchPrediction sx={{ mr: 0.5 }} color="action" />
                          <Typography variant="body2">{property.bathrooms} Baths</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          View Details
                        </Button>
                        <Box>
                          <IconButton onClick={() => handleFavorite(property.id)}>
                            {property.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                          </IconButton>
                          <IconButton onClick={() => handleShare(property)}>
                            <Share />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {properties.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PropertyList;