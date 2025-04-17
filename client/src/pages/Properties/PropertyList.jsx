import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Button, IconButton,
  ToggleButtonGroup, ToggleButton, CircularProgress, Dialog, DialogContent,
  TextField, InputAdornment, Pagination, MenuItem
} from '@mui/material';
import {
  Add, GridView, List, Share, Map, Download
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyCard from '../../components/properties/PropertyCard';
import PropertyMap from '../../components/properties/PropertyMap';
import { propertyService } from '../../services/propertyService';
import useAuth from '../../contexts/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Use named import, not just string

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const filters = {
        page,
        sort: sortBy,
        minPrice,
        maxPrice,
        bedrooms,
        amenities,
        country: 'United Kingdom'
      };

      const res = await propertyService.getProperties(filters);
      setProperties(res.data?.properties || []);
      const total = res.data?.pagination?.total || 0;
      setTotalPages(Math.ceil(total / 12));
    } catch (err) {
      console.error('❌ Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy]);

  const handlePageChange = (e, val) => {
    setPage(val);
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set('page', val);
    setSearchParams(updatedParams);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchProperties();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Property Listings', 14, 15);
    const tableData = properties.map(p => [
      p.title,
      `£${p.price}`,
      `${p.features?.bedrooms || 0} Beds`,
      `${p.features?.bathrooms || 0} Baths`,
      `${p.features?.squareFeet || 0} sq ft`,
      p.location?.city || ''
    ]);

    autoTable(doc, {
      head: [['Title', 'Price', 'Beds', 'Baths', 'Area', 'City']],
      body: tableData,
      startY: 20
    });

    doc.save('property-listings.pdf');
  };

  const handleImageClick = (url) => setLightboxImg(url);
  const handleLightboxClose = () => setLightboxImg(null);

  const handleShare = async (property, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${property._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch {
      alert('Failed to share');
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties(prev => prev.filter(p => p._id !== propertyId));
        alert('✅ Deleted successfully');
      } catch (err) {
        console.error('❌ Delete failed error:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.response?.data?.message,
        });
        alert(err?.response?.data?.message || 'Delete failed. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box p={3}>
        <Typography variant="h5" gutterBottom>Property Listings</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Total: {properties.length} · Page: {page}/{totalPages}
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <TextField
            select
            label="Sort By"
            size="small"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_low">Price Low to High</MenuItem>
            <MenuItem value="price_high">Price High to Low</MenuItem>
          </TextField>

          <TextField
            label="Min Price"
            size="small"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
          />

          <TextField
            label="Max Price"
            size="small"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
          />

          <TextField
            label="Bedrooms"
            size="small"
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            type="number"
          />

          <TextField
            label="Amenities"
            size="small"
            value={amenities}
            onChange={e => setAmenities(e.target.value)}
          />

          <Button onClick={handleApplyFilters} variant="contained" sx={{ ml: 1 }}>
            Apply
          </Button>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            {['admin', 'agent'].includes(user?.role) && (
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/properties/add')} sx={{ mr: 2 }}>
                Add Property
              </Button>
            )}
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </Box>
          <Box>
            <IconButton onClick={() => setShowMap(!showMap)}><Map /></IconButton>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)}>
              <ToggleButton value="grid" aria-label="Grid View"><GridView /></ToggleButton>
              <ToggleButton value="list" aria-label="List View"><List /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {showMap ? (
          <PropertyMap properties={properties} />
        ) : loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : properties.length === 0 ? (
          <Typography>No properties found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {properties.map(property => (
              <Grid
                key={property._id}
                item
                xs={12}
                sm={viewMode === 'grid' ? 6 : 12}
                md={viewMode === 'grid' ? 4 : 12}
              >
                <PropertyCard
                  property={property}
                  role={user?.role}
                  onShare={handleShare}
                  onDelete={handleDelete}
                  onImageClick={handleImageClick}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        <Dialog open={!!lightboxImg} onClose={handleLightboxClose} maxWidth="md">
          <DialogContent>
            <img src={lightboxImg} alt="Property" style={{ width: '100%', borderRadius: 4 }} />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PropertyList;
