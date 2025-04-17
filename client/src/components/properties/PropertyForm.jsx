// real-estate-crm/client/src/components/properties/PropertyForm.jsx

import { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, Typography, IconButton,
  ImageList, ImageListItem, ImageListItemBar, LinearProgress,
  Chip, Stack, CircularProgress
} from '@mui/material';
import { Delete, Add, Star } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  validateImage,
  processImages,
  createImagePreview,
  revokeImagePreview
} from '../../utils/imageUpload';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(3).max(100),
  description: Yup.string().required('Description is required').min(10),
  price: Yup.number().required('Price is required').positive().max(1000000000),
  location: Yup.string().required('Location is required').min(3),
  propertyType: Yup.string().required('Property type is required'),
  area: Yup.number().required('Area is required').positive(),
  bedrooms: Yup.number().min(0, 'Bedrooms cannot be negative').integer(),
  bathrooms: Yup.number().min(0, 'Bathrooms cannot be negative').integer(),
  amenities: Yup.array().of(Yup.string())
});

const amenitiesList = [
  'Pool', 'Garage', 'Garden', 'Balcony', 'Security System',
  'Air Conditioning', 'Heating', 'Furnished', 'Parking', 'Gym',
  'Storage', 'Elevator', 'Pet Friendly'
];

const PropertyForm = ({ initialData, onSubmit, isLoading }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    return () => previews.forEach(revokeImagePreview);
  }, [previews]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setImageError('');
    setUploadProgress(0);

    try {
      for (const file of files) validateImage(file);
      const processed = await processImages(files, setUploadProgress);
      const newPreviews = processed.map(createImagePreview);
      setPreviews(prev => [...prev, ...newPreviews]);
      setImageFiles(prev => [...prev, ...processed]);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (index) => {
    revokeImagePreview(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (coverIndex === index) setCoverIndex(0);
    else if (index < coverIndex) setCoverIndex(prev => prev - 1);
  };

  const formik = useFormik({
    initialValues: initialData || {
      title: '', description: '', price: '', location: '',
      propertyType: '', bedrooms: '', bathrooms: '', area: '',
      amenities: []
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (imageFiles.length === 0) return setImageError('At least one image is required');

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          Array.isArray(value)
            ? value.forEach(v => formData.append(`${key}[]`, v))
            : formData.append(key, value);
        });

        imageFiles.forEach((file, i) => {
          formData.append('images', file);
          if (i === coverIndex) formData.append('coverIndex', i);
        });

        await onSubmit(formData);
      } catch (err) {
        console.error('Submit error:', err);
        setImageError(err.message);
      }
    }
  });

  return (
    <Paper component="form" onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}><Typography variant="h6">{initialData ? 'Edit Property' : 'Add New Property'}</Typography></Grid>

        {[ 'title', 'description', 'price', 'location', 'area', 'bedrooms', 'bathrooms' ].map(name => (
          <Grid item xs={12} sm={6} key={name}>
            <TextField
              fullWidth
              name={name}
              label={name.charAt(0).toUpperCase() + name.slice(1)}
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[name] && !!formik.errors[name]}
              helperText={formik.touched[name] && formik.errors[name]}
              multiline={name === 'description'}
              rows={name === 'description' ? 4 : undefined}
              type={['price', 'area', 'bedrooms', 'bathrooms'].includes(name) ? 'number' : 'text'}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={formik.touched.propertyType && !!formik.errors.propertyType}>
            <InputLabel>Property Type</InputLabel>
            <Select
              name="propertyType"
              value={formik.values.propertyType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Property Type"
            >
              {[ 'house', 'apartment', 'condo', 'townhouse', 'land' ].map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {formik.touched.propertyType && <Typography color="error" variant="caption">{formik.errors.propertyType}</Typography>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Amenities</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {amenitiesList.map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                aria-pressed={formik.values.amenities.includes(amenity)}
                onClick={() => {
                  const current = formik.values.amenities || [];
                  const updated = current.includes(amenity)
                    ? current.filter(a => a !== amenity)
                    : [...current, amenity];
                  formik.setFieldValue('amenities', updated);
                }}
                color={formik.values.amenities.includes(amenity) ? 'primary' : 'default'}
              />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Button component="label" variant="outlined" startIcon={<Add />} disabled={uploadProgress > 0}>
            Upload Images
            <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
          </Button>

          {uploadProgress > 0 && <Box sx={{ mt: 1 }}><LinearProgress variant="determinate" value={uploadProgress} /></Box>}
          {imageError && <Typography color="error" variant="caption">{imageError}</Typography>}

          <ImageList cols={4} rowHeight={160} sx={{ mt: 2 }}>
            {previews.map((preview, index) => (
              <ImageListItem key={index}>
                <img src={preview} alt={`Preview ${index + 1}`} loading="lazy" />
                <ImageListItemBar
                  title={index === coverIndex ? 'Cover' : ''}
                  actionIcon={
                    <Box>
                      <IconButton onClick={() => setCoverIndex(index)} title="Set as cover"><Star sx={{ color: index === coverIndex ? 'gold' : 'white' }} /></IconButton>
                      <IconButton onClick={() => handleRemoveImage(index)}><Delete sx={{ color: 'white' }} /></IconButton>
                    </Box>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="button" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid} startIcon={isLoading && <CircularProgress size={20} color="inherit" />}>
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyForm;
