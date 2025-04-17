import { useEffect, useState } from 'react';
import {
  Box, Grid, TextField, Typography, Button, Chip, Paper,
  CircularProgress, LinearProgress, ImageList, ImageListItem,
  ImageListItemBar, IconButton
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

const amenitiesList = [
  'Pool', 'Garage', 'Garden', 'Balcony', 'Security System',
  'Air Conditioning', 'Heating', 'Furnished', 'Parking', 'Gym',
  'Storage', 'Elevator', 'Pet Friendly'
];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(3).max(100),
  description: Yup.string().required('Description is required').min(10),
  price: Yup.number().required('Price is required').positive().max(1000000000),
  type: Yup.string().required('Type is required'),
  location: Yup.object().shape({
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP Code is required'),
    country: Yup.string().required('Country is required'),
    lat: Yup.number(),
    lng: Yup.number()
  }),
  features: Yup.object().shape({
    bedrooms: Yup.number().required('Bedrooms required'),
    bathrooms: Yup.number().required('Bathrooms required'),
    squareFeet: Yup.number().required('Square feet required'),
    amenities: Yup.array().of(Yup.string())
  })
});

const PropertyForm = ({ initialValues, isEditMode = false, isLoading = false, onSubmit, DraggableMap }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    return () => previews.forEach(revokeImagePreview);
  }, [previews]);

  const formik = useFormik({
    initialValues: initialValues || {
      title: '', description: '', price: '', type: '',
      location: { address: '', city: '', state: '', zipCode: '', country: '', lat: '', lng: '' },
      features: { bedrooms: '', bathrooms: '', squareFeet: '', amenities: [] }
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (imageFiles.length === 0) return setImageError('At least one image is required');

        const formData = new FormData();
        formData.append('data', JSON.stringify(values));
        imageFiles.forEach((file) => formData.append('images', file));
        await onSubmit(formData);
      } catch (err) {
        setImageError(err.message);
      }
    }
  });

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

  return (
    <Paper component="form" onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}><Typography variant="h6">{isEditMode ? 'Edit Property' : 'Add New Property'}</Typography></Grid>

        {[ 'title', 'description', 'price' ].map(field => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              name={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[field] && !!formik.errors[field]}
              helperText={formik.touched[field] && formik.errors[field]}
              multiline={field === 'description'}
              rows={field === 'description' ? 4 : undefined}
              type={field === 'price' ? 'number' : 'text'}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            error={formik.touched.type && !!formik.errors.type}
            helperText={formik.touched.type && formik.errors.type}
          />
        </Grid>

        {['address', 'city', 'state', 'zipCode', 'country'].map(field => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={`location.${field}`}
              value={formik.values.location[field] || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.location?.[field] && !!formik.errors.location?.[field]}
              helperText={formik.touched.location?.[field] && formik.errors.location?.[field]}
            />
          </Grid>
        ))}

        {['bedrooms', 'bathrooms', 'squareFeet'].map(field => (
          <Grid item xs={12} sm={4} key={field}>
            <TextField
              fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={`features.${field}`}
              type="number"
              value={formik.values.features[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.features?.[field] && !!formik.errors.features?.[field]}
              helperText={formik.touched.features?.[field] && formik.errors.features?.[field]}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography variant="subtitle1">Amenities</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {amenitiesList.map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                clickable
                color={formik.values.features.amenities.includes(amenity) ? 'primary' : 'default'}
                onClick={() => {
                  const updated = formik.values.features.amenities.includes(amenity)
                    ? formik.values.features.amenities.filter((a) => a !== amenity)
                    : [...formik.values.features.amenities, amenity];
                  formik.setFieldValue('features.amenities', updated);
                }}
              />
            ))}
          </Box>
        </Grid>

        {DraggableMap && (
          <Grid item xs={12}>
            <Typography variant="subtitle1">Select Location on Map</Typography>
            <DraggableMap setFieldValue={formik.setFieldValue} />
          </Grid>
        )}

        <Grid item xs={12}>
          <Button component="label" variant="outlined" startIcon={<Add />} disabled={uploadProgress > 0}>
            Upload Images
            <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
          </Button>
          {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />}
          {imageError && <Typography color="error" variant="caption">{imageError}</Typography>}

          <ImageList cols={4} rowHeight={160} sx={{ mt: 2 }}>
            {previews.map((preview, index) => (
              <ImageListItem key={index}>
                <img src={preview} alt={`Preview ${index + 1}`} loading="lazy" />
                <ImageListItemBar
                  title={index === coverIndex ? 'Cover' : ''}
                  actionIcon={
                    <Box>
                      <IconButton onClick={() => setCoverIndex(index)}><Star sx={{ color: index === coverIndex ? 'gold' : 'white' }} /></IconButton>
                      <IconButton onClick={() => handleRemoveImage(index)}><Delete sx={{ color: 'white' }} /></IconButton>
                    </Box>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
          <Button type="button" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid} startIcon={isLoading && <CircularProgress size={20} />}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyForm;
