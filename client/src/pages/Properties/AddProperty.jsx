import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, TextField, Grid, Typography, Chip, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import DraggableMap from '../../components/maps/DraggableMap';

const amenitiesOptions = [
  'Pool', 'Garage', 'Garden', 'Balcony', 'Security System',
  'Air Conditioning', 'Heating', 'Furnished', 'Parking', 'Gym',
  'Storage', 'Elevator', 'Pet Friendly'
];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').positive(),
  type: Yup.string().required('Type is required'),
  location: Yup.object().shape({
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP Code is required'),
    country: Yup.string().required('Country is required')
  }),
  features: Yup.object().shape({
    bedrooms: Yup.number().required('Bedrooms are required').positive(),
    bathrooms: Yup.number().required('Bathrooms are required').positive(),
    squareFeet: Yup.number().required('Area is required').positive(),
    amenities: Yup.array().of(Yup.string())
  }),
  images: Yup.array().min(1, 'At least one image is required')
});

const AddProperty = () => {
  const navigate = useNavigate();

  const initialValues = {
    title: '',
    description: '',
    price: '',
    type: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      lat: 0,
      lng: 0
    },
    features: {
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      amenities: []
    },
    status: 'available',
    images: []
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('type', values.type);
      formData.append('status', values.status);

      // Append location fields
      Object.keys(values.location).forEach(key => {
        formData.append(`location[${key}]`, values.location[key]);
      });

      // Append features
      Object.keys(values.features).forEach(key => {
        if (key === 'amenities') {
          values.features.amenities.forEach(amenity => {
            formData.append('features[amenities][]', amenity);
          });
        } else {
          formData.append(`features[${key}]`, values.features[key]);
        }
      });

      // Append images
      if (values.images?.length > 0) {
        values.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (image.file instanceof File) {
            formData.append('images', image.file);
          } else if (image.url) {
            formData.append('imageUrls[]', image.url);
          }
        });
      }

      const response = await propertyService.createProperty(formData);
      
      if (response?.data) {
        toast.success('Property created successfully!');
        navigate('/properties');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error(error?.response?.data?.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Add New Property</Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, handleChange, errors, touched, setFieldValue }) => (
          <Form encType="multipart/form-data">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="title" 
                  label="Title" 
                  fullWidth 
                  value={values.title} 
                  onChange={handleChange} 
                  error={touched.title && !!errors.title} 
                  helperText={touched.title && errors.title} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="description" 
                  label="Description" 
                  fullWidth 
                  multiline 
                  minRows={3} 
                  value={values.description} 
                  onChange={handleChange} 
                  error={touched.description && !!errors.description} 
                  helperText={touched.description && errors.description} 
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField 
                  name="price" 
                  label="Price" 
                  fullWidth 
                  type="number" 
                  value={values.price} 
                  onChange={handleChange}
                  error={touched.price && !!errors.price}
                  helperText={touched.price && errors.price}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  name="type" 
                  label="Type" 
                  fullWidth 
                  value={values.type} 
                  onChange={handleChange}
                  error={touched.type && !!errors.type}
                  helperText={touched.type && errors.type}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  name="features.squareFeet" 
                  label="Area (sqft)" 
                  fullWidth 
                  type="number" 
                  value={values.features.squareFeet} 
                  onChange={handleChange}
                  error={touched.features?.squareFeet && !!errors.features?.squareFeet}
                  helperText={touched.features?.squareFeet && errors.features?.squareFeet}
                />
              </Grid>

              <Grid item xs={12}>
                <DraggableMap setFieldValue={setFieldValue} />
              </Grid>

              {["address", "city", "state", "zipCode", "country"].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    name={`location.${field}`}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    fullWidth
                    value={values.location[field]}
                    onChange={handleChange}
                    error={touched.location?.[field] && !!errors.location?.[field]}
                    helperText={touched.location?.[field] && errors.location?.[field]}
                  />
                </Grid>
              ))}

              <Grid item xs={6} sm={3}>
                <TextField 
                  name="features.bedrooms" 
                  label="Bedrooms" 
                  fullWidth 
                  type="number" 
                  value={values.features.bedrooms} 
                  onChange={handleChange}
                  error={touched.features?.bedrooms && !!errors.features?.bedrooms}
                  helperText={touched.features?.bedrooms && errors.features?.bedrooms}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField 
                  name="features.bathrooms" 
                  label="Bathrooms" 
                  fullWidth 
                  type="number" 
                  value={values.features.bathrooms} 
                  onChange={handleChange}
                  error={touched.features?.bathrooms && !!errors.features?.bathrooms}
                  helperText={touched.features?.bathrooms && errors.features?.bathrooms}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Amenities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {amenitiesOptions.map((amenity) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      clickable
                      color={values.features.amenities.includes(amenity) ? 'primary' : 'default'}
                      onClick={() => {
                        const exists = values.features.amenities.includes(amenity);
                        const updated = exists
                          ? values.features.amenities.filter((a) => a !== amenity)
                          : [...values.features.amenities, amenity];
                        setFieldValue('features.amenities', updated);
                      }}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <ImageUploader onUploadSuccess={(uploaded) => setFieldValue('images', uploaded)} />
              </Grid>

              <Grid item xs={12} display="flex" gap={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Property'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProperty;