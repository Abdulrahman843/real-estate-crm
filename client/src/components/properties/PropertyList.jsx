import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, useTheme, useMediaQuery, CardMedia, CardContent, CardActions,
  Typography, Button, Box, IconButton, Chip, Skeleton,
  TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Pagination, Stack, Alert, Checkbox, Dialog, DialogTitle, DialogContent,
  TableContainer, Table, TableHead, TableBody,
  TableRow, TableCell, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Add, Edit, Delete, LocationOn, Hotel,
  Bathtub, SquareFoot, Search, GridView, ViewList, Compare, Close
} from '@mui/icons-material';
import { propertyService } from '../../services/propertyService';
import PropertyFilters from './PropertyFilters';
import PropertyMap from './PropertyMap';
import PropertyAnalytics from '../dashboard/PropertyAnalytics';
import { getFeatureFlags } from '../../config/featureFlags';

const featureFlags = getFeatureFlags();

const PropertySkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} />
      <Skeleton variant="text" width="60%" />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
    </CardContent>
    <CardActions>
      <Skeleton variant="rounded" width={100} height={36} />
    </CardActions>
  </Card>
);

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = 9;
  const navigate = useNavigate();

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.searchProperties({
        search: searchQuery,
        sort: sortBy,
        page,
        limit: itemsPerPage,
        ...filters
      });
      setProperties(response.properties);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      if (featureFlags.enableAnalytics) setAnalyticsData(response.analytics || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, page, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProperties();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, filters, fetchProperties]);

  useEffect(() => {
    fetchProperties();
  }, [page, fetchProperties]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const togglePropertySelection = (propertyId) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleCompare = () => {
    if (selectedProperties.length < 2) {
      setError('Please select at least 2 properties to compare');
      return;
    }
    setCompareMode(true);
  };

  const PropertyCard = ({ property }) => (
    <Card
      elevation={2}
      sx={{ position: 'relative', outline: selectedProperties.includes(property.id) ? '2px solid #1976d2' : 'none' }}
    >
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <Checkbox
          checked={selectedProperties.includes(property.id)}
          onChange={() => togglePropertySelection(property.id)}
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}
        />
      </Box>
      <CardMedia component="img" height="200" image={property.images[0]} alt={property.title} />
      <CardContent>
        <Typography variant="h6" noWrap>{property.title}</Typography>
        <Typography variant="h5" color="primary" gutterBottom>${property.price.toLocaleString()}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" noWrap>{property.location}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip size="small" icon={<Hotel />} label={`${property.bedrooms} Beds`} />
          <Chip size="small" icon={<Bathtub />} label={`${property.bathrooms} Baths`} />
          <Chip size="small" icon={<SquareFoot />} label={`${property.area} sq ft`} />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>{property.description}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" onClick={() => navigate(`/properties/${property.id}`)}>View Details</Button>
        <Box>
          <IconButton size="small" onClick={() => navigate(`/properties/edit/${property.id}`)}><Edit /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(property.id)}><Delete /></IconButton>
        </Box>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Properties</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/properties/new')}>Add Property</Button>
      </Box>

      <Stack spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 2 
        }}>
          <TextField
            fullWidth
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
              <MenuItem value="area_desc">Largest Area</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small">
            <ToggleButton value="grid"><GridView /></ToggleButton>
            <ToggleButton value="list"><ViewList /></ToggleButton>
          </ToggleButtonGroup>

          {featureFlags.enablePropertyComparison && selectedProperties.length > 0 && (
            <Button variant="outlined" startIcon={<Compare />} onClick={handleCompare}>
              Compare ({selectedProperties.length})
            </Button>
          )}
        </Box>

        <PropertyFilters onFilterChange={handleFilterChange} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {loading ? (
          Array(itemsPerPage).fill(0).map((_, index) => (
            <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} key={index}>
              <PropertySkeleton />
            </Grid>
          ))
        ) : properties.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No properties found
              </Typography>
            </Box>
          </Grid>
        ) : (
          properties.map(property => (
            <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))
        )}
      </Grid>

      {!loading && properties.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" size="large" />
        </Box>
      )}

      <PropertyMap properties={properties} />
      {featureFlags.enableAnalytics && <PropertyAnalytics data={analyticsData} />}

      <Dialog open={compareMode} onClose={() => setCompareMode(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Property Comparison
          <IconButton onClick={() => setCompareMode(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  {properties.filter(p => selectedProperties.includes(p.id)).map(p => (
                    <TableCell key={p.id}>{p.title}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {['price', 'location', 'bedrooms', 'bathrooms', 'area'].map(feature => (
                  <TableRow key={feature}>
                    <TableCell>{feature.charAt(0).toUpperCase() + feature.slice(1)}</TableCell>
                    {properties.filter(p => selectedProperties.includes(p.id)).map(p => (
                      <TableCell key={p.id}>{feature === 'price' ? `$${p[feature].toLocaleString()}` : p[feature]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PropertyList;
