import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Snackbar, Alert, Box, Grid, Card, CardMedia, CardContent, Typography,
  Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  Pagination, ToggleButton, ToggleButtonGroup, CircularProgress,
  TextField, Chip, Drawer, Container
} from '@mui/material';
import {
  Favorite, FavoriteBorder, GridView, List, Share, LocationOn,
  Hotel, BatchPrediction, Map, FilterList, Download, Add
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import PropertyMap from '../../components/properties/PropertyMap';
import { propertyService } from '../../services/propertyService';
import useAuth from '../../contexts/useAuth';

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || []
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          sortBy,
          ...filters,
          country: 'United Kingdom'
        };
        const response = await propertyService.getProperties(params);
        setProperties(response.data?.properties || []);
        setTotalPages(Math.ceil((response.data?.total || 0) / 12));
      } catch (error) {
        console.error('Error fetching properties:', error);
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
  }, [page, sortBy, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        newParams.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    });
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const resetFilters = () => {
    setFilters({
      title: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      amenities: []
    });
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    const { address, city, state, zipCode } = location;
    return [address, city, state, zipCode].filter(Boolean).join(', ');
  };

  const handleExport = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Title', 'Price', 'Location', 'Features']],
      body: properties.map(property => [
        property.title,
        `£${(property.price || 0).toLocaleString()}`,
        formatLocation(property.location),
        `${property.features?.bedrooms || 0} beds, ${property.features?.bathrooms || 0} baths`
      ])
    });
    doc.save('properties-list.pdf');
  };

  const handleFavorite = async (propertyId, event) => {
    event.stopPropagation();
    try {
      await propertyService.toggleFavorite(propertyId);
      setProperties(prev =>
        prev.map(p => p._id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p)
      );
      setSnackbar({
        open: true,
        message: 'Property favorite status updated',
        severity: 'success'
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update favorite status',
        severity: 'error'
      });
    }
  };

  const handleShare = async (property, event) => {
    event.stopPropagation();
    const url = `${window.location.origin}/properties/${property._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard',
          severity: 'success'
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to share property',
        severity: 'error'
      });
    }
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  return (
    <Container maxWidth="xl">
      <Box p={3}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
            </Select>
          </FormControl>

          <Box>
            {['agent', 'admin'].includes(user?.role) && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/properties/add')}
                sx={{ mr: 2 }}
              >
                Add Property
              </Button>
            )}
            <IconButton onClick={() => setFilterDrawer(true)} sx={{ mr: 1 }}>
              <FilterList />
            </IconButton>
            <IconButton onClick={() => setShowMap(!showMap)} sx={{ mr: 1 }}>
              <Map />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ mr: 1 }}>
              <Download />
            </IconButton>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)}>
              <ToggleButton value="grid"><GridView /></ToggleButton>
              <ToggleButton value="list"><List /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {showMap ? (
          <PropertyMap properties={properties} />
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: 'center', py: 3 }}>
            No properties found
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={property._id}>
                <Card onClick={() => handlePropertyClick(property._id)} sx={{ cursor: 'pointer' }}>
                  <CardMedia
                    component="img"
                    height={viewMode === 'grid' ? 200 : 300}
                    image={property.images?.[0]?.url || '/placeholder-property.jpg'}
                    alt={property.title}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{property.title}</Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      £{(property.price || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <LocationOn sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
                      {formatLocation(property.location)}
                    </Typography>
                    <Box display="flex" gap={2} my={1}>
                      <Typography variant="body2">
                        <Hotel sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
                        {property.features?.bedrooms || 0} Beds
                      </Typography>
                      <Typography variant="body2">
                        <BatchPrediction sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
                        {property.features?.bathrooms || 0} Baths
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Button
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property._id);
                        }}
                      >
                        View Details
                      </Button>
                      <Box>
                        <IconButton onClick={(e) => handleFavorite(property._id, e)}>
                          {property.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                        </IconButton>
                        <IconButton onClick={(e) => handleShare(property, e)}>
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

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>

        <Drawer
          anchor="right"
          open={filterDrawer}
          onClose={() => setFilterDrawer(false)}
        >
          <Box sx={{ width: 300, p: 3 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            <TextField
              fullWidth
              label="Search by Title"
              value={filters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['Pool', 'Garage', 'Garden', 'Balcony', 'Security'].map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    color={filters.amenities.includes(amenity) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button fullWidth variant="contained" onClick={() => setFilterDrawer(false)}>
                Apply Filters
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={resetFilters}
                sx={{ mt: 1 }}
              >
                Reset Filters
              </Button>
            </Box>
          </Box>
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PropertyList;