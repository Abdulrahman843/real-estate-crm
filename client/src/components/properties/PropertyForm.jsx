import { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, Typography, IconButton,
  ImageList, ImageListItem, ImageListItemBar, LinearProgress,
  Chip, Stack
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
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

  useEffect(() => {
    return () => {
      previews.forEach(preview => revokeImagePreview(preview));
    };
  }, [previews]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setImageError('');
    setUploadProgress(0);

    try {
      for (const file of files) {
        validateImage(file);
      }

      const processed = await processImages(files, (progress) => {
        setUploadProgress(progress);
      });

      const newPreviews = processed.map(file => createImagePreview(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      setImageFiles(prev => [...prev, ...processed]);
    } catch (error) {
      setImageError(error.message);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (index) => {
    revokeImagePreview(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const formik = useFormik({
    initialValues: initialData || {
      title: '',
      description: '',
      price: '',
      location: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      amenities: []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (imageFiles.length === 0) {
          setImageError('At least one image is required');
          return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value);
          }
        });

        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
        setImageError(error.message);
      }
    }
  });

  return (
    <Paper component="form" onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {initialData ? 'Edit Property' : 'Add New Property'}
          </Typography>
        </Grid>

        {[
          { name: 'title', label: 'Property Title' },
          { name: 'description', label: 'Description', multiline: true, rows: 4 },
          { name: 'price', label: 'Price', type: 'number' },
          { name: 'location', label: 'Location' },
          { name: 'area', label: 'Area (sq ft)', type: 'number' },
          { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
          { name: 'bathrooms', label: 'Bathrooms', type: 'number' }
        ].map(({ name, ...rest }) => (
          <Grid item xs={12} sm={6} key={name}>
            <TextField
              fullWidth
              name={name}
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[name] && Boolean(formik.errors[name])}
              helperText={formik.touched[name] && formik.errors[name]}
              {...rest}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}>
            <InputLabel>Property Type</InputLabel>
            <Select
              name="propertyType"
              value={formik.values.propertyType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Property Type"
            >
              {['house', 'apartment', 'condo', 'townhouse', 'land'].map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {formik.touched.propertyType && formik.errors.propertyType && (
              <Typography color="error" variant="caption">{formik.errors.propertyType}</Typography>
            )}
          </FormControl>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Amenities</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {amenitiesList.map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                onClick={() => {
                  const current = formik.values.amenities || [];
                  const updated = current.includes(amenity)
                    ? current.filter(a => a !== amenity)
                    : [...current, amenity];
                  formik.setFieldValue('amenities', updated);
                }}
                color={formik.values.amenities?.includes(amenity) ? 'primary' : 'default'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
          {formik.touched.amenities && formik.errors.amenities && (
            <Typography color="error" variant="caption">
              {formik.errors.amenities}
            </Typography>
          )}
        </Grid>

        {/* Image Upload */}
        <Grid item xs={12}>
          <Button component="label" variant="outlined" startIcon={<Add />} sx={{ mt: 1 }} disabled={uploadProgress > 0}>
            Upload Images
            <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} />
          </Button>

          {uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary">
                Processing images: {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          {imageError && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              {imageError}
            </Typography>
          )}

          <ImageList sx={{ mt: 2 }} cols={4} rowHeight={164}>
            {previews.map((preview, index) => (
              <ImageListItem key={index}>
                <img src={preview} alt={`Preview ${index + 1}`} loading="lazy" />
                <ImageListItemBar
                  actionIcon={
                    <IconButton sx={{ color: 'white' }} onClick={() => handleRemoveImage(index)}>
                      <Delete />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="button" onClick={() => window.history.back()}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyForm;
