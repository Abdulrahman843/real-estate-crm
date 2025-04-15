import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Snackbar, Alert, Box, Grid, Card, CardMedia, CardContent, Typography,
  Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  Pagination, ToggleButton, ToggleButtonGroup, CircularProgress,
  TextField, Chip, Drawer
} from '@mui/material';
import {
  Favorite, FavoriteBorder, GridView, List, Share, LocationOn,
  Hotel, BatchPrediction, Map, CompareArrows, Download, Add
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import PropertyMap from '../../components/properties/PropertyMap';
import { propertyService } from '../../services/propertyService';
import useAuth from '../../contexts/useAuth';

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Add this to check user role

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [compareList, setCompareList] = useState([]);

  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: searchParams.get('amenities')?.split(',') || []
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          sortBy,
          country: 'United Kingdom',
          ...Object.fromEntries(searchParams.entries())
        };
        const data = await propertyService.getProperties(params);
        setProperties(data.properties);
        setTotalPages(Math.ceil(data.pagination?.total / 12) || 1);
      } catch {
        setSnackbar({ open: true, message: 'Failed to fetch properties', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchParams, page, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', 1);
    newParams.set('country', 'United Kingdom');
    setSearchParams(newParams);
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters(prev => ({ ...prev, amenities: newAmenities }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('amenities', newAmenities.join(','));
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setFilters({ title: '', city: '', minPrice: '', maxPrice: '', amenities: [] });
    const newParams = new URLSearchParams();
    newParams.set('page', 1);
    newParams.set('country', 'United Kingdom');
    setSearchParams(newParams);
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    const { address, city, state, zipCode } = location;
    return `${address}, ${city}, ${state} ${zipCode}`;
  };

  const handleExport = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Title', 'Price', 'Location']],
      body: properties.map(p => [
        p.title,
        `$${p.price.toLocaleString()}`,
        formatLocation(p.location)
      ])
    });
    doc.save('property-listings.pdf');
  };

  const handleFavorite = async (propertyId) => {
    try {
      await propertyService.toggleFavorite(propertyId);
      setProperties(prev =>
        prev.map(p => p._id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p)
      );
      setSnackbar({ open: true, message: 'Updated favorites', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update favorite', severity: 'error' });
    }
  };

  const handleShare = (property) => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: `${window.location.origin}/properties/${property._id}`
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => copyToClipboard(shareData.url));
    } else {
      copyToClipboard(shareData.url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => setSnackbar({ open: true, message: 'Link copied', severity: 'success' }))
      .catch(() => setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' }));
  };

  const handleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.find(p => p._id === property._id);
      return exists ? prev.filter(p => p._id !== property._id) : [...prev, property];
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_low">Price: Low to High</MenuItem>
            <MenuItem value="price_high">Price: High to Low</MenuItem>
          </Select>
        </FormControl>

        <Box>
          {['agent', 'admin'].includes(user?.role) && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/properties/add')} sx={{ mr: 2 }}>
              Add Property
            </Button>
          )}
          <IconButton onClick={() => setShowMap(!showMap)}><Map /></IconButton>
          <IconButton onClick={handleExport}><Download /></IconButton>
          <IconButton onClick={() => setFilterDrawer(true)}><CompareArrows /></IconButton>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)}>
            <ToggleButton value="grid"><GridView /></ToggleButton>
            <ToggleButton value="list"><List /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {showMap ? (
        <PropertyMap properties={properties} />
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : properties.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', py: 3 }}>No properties found</Typography>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={property._id}>
              <Card>
                <CardMedia
                  component="img"
                  height={viewMode === 'grid' ? 200 : 300}
                  image={property.images?.[0]?.url || '/images/placeholder.jpg'}
                  alt={property.title}
                />
                <CardContent>
                  <Typography variant="h6">{property.title}</Typography>
                  <Typography variant="h5" color="primary">${property.price.toLocaleString()}</Typography>
                  <Typography variant="body2"><LocationOn /> {formatLocation(property.location)}</Typography>
                  <Box display="flex" gap={2} my={1}>
                    <Typography variant="body2"><Hotel /> {property.bedrooms} Beds</Typography>
                    <Typography variant="body2"><BatchPrediction /> {property.bathrooms} Baths</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Button variant="contained" onClick={() => navigate(`/properties/${property._id}`)}>View</Button>
                    <Box>
                      <IconButton onClick={() => handleFavorite(property._id)}>
                        {property.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                      </IconButton>
                      <IconButton onClick={() => handleShare(property)}><Share /></IconButton>
                      <IconButton onClick={() => handleCompare(property)}>
                        <CompareArrows color={compareList.find(p => p._id === property._id) ? 'primary' : 'inherit'} />
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
        <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
      </Box>

      <Drawer anchor="right" open={filterDrawer} onClose={() => setFilterDrawer(false)}>
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="h6">Filters</Typography>
          <TextField fullWidth label="Search by Title" sx={{ mt: 2 }} value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
          <TextField fullWidth label="City" sx={{ mt: 2 }} value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
          <TextField fullWidth label="Min Price" type="number" sx={{ mt: 2 }} value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
          <TextField fullWidth label="Max Price" type="number" sx={{ mt: 2 }} value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['House', 'Apartment', 'Condo'].map(type => (
              <Chip
                key={type}
                label={type}
                clickable
                color={filters.amenities.includes(type) ? 'primary' : 'default'}
                onClick={() => toggleAmenity(type)}
              />
            ))}
          </Box>
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setFilterDrawer(false)}>Apply Filters</Button>
          <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={resetFilters}>Reset</Button>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PropertyList;
