// client/src/components/properties/PropertyFilters.jsx (Refactored)

import React, { useState, useEffect } from 'react';
import {
  Box, Accordion, AccordionSummary, AccordionDetails, Typography,
  FormControl, InputLabel, Select, MenuItem, Slider, Chip, TextField,
  Grid, IconButton, Button, Tooltip
} from '@mui/material';
import { ExpandMore, FilterList, RestartAlt, Save } from '@mui/icons-material';

const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'];
const amenitiesList = ['Pool', 'Garage', 'Garden', 'Balcony', 'Security'];
const statusOptions = ['For Sale', 'For Rent', 'Sold'];

const defaultFilters = {
  priceRange: [0, 1000000],
  bedrooms: '',
  bathrooms: '',
  propertyType: '',
  amenities: [],
  location: '',
  yearBuilt: '',
  status: ''
};

const formatPrice = (value) => `₣${value.toLocaleString()}`;

const PropertyFilters = ({ onApplyFilters }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const timer = setTimeout(() => onApplyFilters(filters), 500);
    return () => clearTimeout(timer);
  }, [filters, onApplyFilters]);

  const toggleFilterItem = (key, item) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item]
    }));
  };

  const handleReset = () => setFilters(defaultFilters);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterList />
          <Typography>Filters</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}><Typography gutterBottom>Price Range</Typography><Slider value={filters.priceRange} onChange={(_, val) => setFilters(prev => ({ ...prev, priceRange: val }))} valueLabelDisplay="auto" valueLabelFormat={formatPrice} min={0} max={1000000} step={50000} /></Grid>

          <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Property Type</InputLabel><Select value={filters.propertyType} onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}>{propertyTypes.map(type => (<MenuItem key={type} value={type}>{type}</MenuItem>))}</Select></FormControl></Grid>

          <Grid item xs={12} sm={6}><TextField fullWidth label="Location" value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} /></Grid>

          <Grid item xs={12} sm={6}><TextField fullWidth label="Bedrooms" type="number" value={filters.bedrooms} onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))} /></Grid>

          <Grid item xs={12} sm={6}><TextField fullWidth label="Bathrooms" type="number" value={filters.bathrooms} onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))} /></Grid>

          <Grid item xs={12} sm={6}><TextField fullWidth label="Year Built" type="number" value={filters.yearBuilt} onChange={(e) => setFilters(prev => ({ ...prev, yearBuilt: e.target.value }))} /></Grid>

          <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>{statusOptions.map(status => (<MenuItem key={status} value={status}>{status}</MenuItem>))}</Select></FormControl></Grid>

          <Grid item xs={12}><Typography gutterBottom>Amenities</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{amenitiesList.map((amenity) => (<Chip key={amenity} label={amenity} onClick={() => toggleFilterItem('amenities', amenity)} color={filters.amenities.includes(amenity) ? 'primary' : 'default'} />))}</Box></Grid>

          <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Tooltip title="Reset filters"><IconButton onClick={handleReset}><RestartAlt /></IconButton></Tooltip><Button variant="contained" startIcon={<Save />} onClick={() => setExpanded(false)}>Apply Filters</Button></Box></Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default PropertyFilters;