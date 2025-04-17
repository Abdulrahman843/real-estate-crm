import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  IconButton, Alert
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { propertyService } from '../../services/propertyService';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    status: 'available',
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: '',
      yearBuilt: ''
    },
    amenities: [],
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United Kingdom'
    }
  });

  const propertyTypes = ['house', 'apartment', 'condo', 'villa', 'land'];
  const priceOptions = ['50000', '100000', '150000', '200000', '250000', '300000', '350000', '400000', '450000', '500000','550000','600000','650000','700000','750000','800000','850000','900000','950000','1000000'];
  const availableAmenities = ['Pool', 'Garage', 'Garden', 'Balcony', 'Security', 'Gym', 'Parking'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Price must be a number';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.location.address) newErrors.address = 'Address is required';
    if (!formData.location.city) newErrors.city = 'City is required';
    if (!formData.location.state) newErrors.state = 'State/County is required';
    if (!formData.location.zipCode) newErrors.zipCode = 'Postal code is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleImageDelete = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      images.forEach(img => payload.append('images', img.file));
      payload.append('data', JSON.stringify(formData));

      const res = await propertyService.createProperty(payload);

      // ✅ Correct success check
      if (res && res._id) {
        toast.success('Property created successfully');
        navigate('/properties');
      } else {
        toast.error(res.message || 'Failed to create property');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>Add New Property</Typography>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please correct the errors before submitting
          </Alert>
        )}

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="Title" name="title" value={formData.title} onChange={handleInputChange} error={!!errors.title} helperText={errors.title} />
            </Grid>

            {/* Price */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.price}>
                <InputLabel>Price</InputLabel>
                <Select name="price" value={formData.price} onChange={handleInputChange} label="Price">
                  {priceOptions.map(price => (
                    <MenuItem key={price} value={price}>£{price}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Description" name="description" value={formData.description} onChange={handleInputChange} />
            </Grid>

            {/* Property Type & Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.propertyType}>
                <InputLabel>Property Type</InputLabel>
                <Select name="propertyType" value={formData.propertyType} onChange={handleInputChange} label="Property Type">
                  {propertyTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleInputChange} label="Status">
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                  <MenuItem value="rented">Rented</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Features */}
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Bedrooms" name="features.bedrooms" value={formData.features.bedrooms} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Bathrooms" name="features.bathrooms" value={formData.features.bathrooms} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Area (sq ft)" name="features.area" value={formData.features.area} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="number" label="Year Built" name="features.yearBuilt" value={formData.features.yearBuilt} onChange={handleInputChange} />
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6">Amenities</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {availableAmenities.map(amenity => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    clickable
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Grid>

            {/* Location */}
            <Grid item xs={12}><Typography variant="h6">Location</Typography></Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Address" name="location.address" value={formData.location.address} onChange={handleInputChange} error={!!errors.address} helperText={errors.address} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="City" name="location.city" value={formData.location.city} onChange={handleInputChange} error={!!errors.city} helperText={errors.city} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="State/County" name="location.state" value={formData.location.state} onChange={handleInputChange} error={!!errors.state} helperText={errors.state} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Postal Code" name="location.zipCode" value={formData.location.zipCode} onChange={handleInputChange} error={!!errors.zipCode} helperText={errors.zipCode} />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6">Images</Typography>
              {errors.images && <Alert severity="error">{errors.images}</Alert>}
              <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                Upload Images
                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {images.map((img, index) => (
                  <Grid item key={index} xs={6} sm={4} md={3}>
                    <Paper sx={{ position: 'relative' }}>
                      <img src={img.preview} alt="Preview" style={{ width: '100%' }} />
                      <IconButton size="small" onClick={() => handleImageDelete(index)} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => navigate('/properties')}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Property'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddProperty;
