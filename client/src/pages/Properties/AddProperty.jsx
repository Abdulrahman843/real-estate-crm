// real-estate-crm/client/src/pages/Properties/AddProperty.jsx

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
    console.log('SUBMITTING VALUES:', values);

    try {
      const formData = new FormData();

      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('type', values.type);
      formData.append('status', values.status);

      // Flatten nested objects
      Object.entries(values.location).forEach(([key, val]) => {
        formData.append(`location.${key}`, val);
      });

      Object.entries(values.features).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach(v => formData.append(`features.${key}[]`, v));
        } else {
          formData.append(`features.${key}`, val);
        }
      });

      values.images.forEach((img) => {
        if (img?.file) {
          formData.append('images', img.file);
        } else if (img?.url) {
          formData.append('images', img.url);
        }
      });

      const response = await propertyService.createProperty(formData);
      if (response?.success || response?.status === 201) {
        toast.success('Property created successfully');
        navigate('/properties');
      } else {
        toast.error('Failed to create property');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Submission failed');
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
        onSubmit={async (values, { setSubmitting, setFieldValue }) => {
          // Fallback: add street view if no image selected
          if (!values.images.length) {
            const { address, city, state, zipCode, country } = values.location;
            const encoded = encodeURIComponent(`${address}, ${city}, ${state}, ${zipCode}, ${country}`);
            const fallbackUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encoded}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
            await setFieldValue('images', [{ url: fallbackUrl, label: 'cover' }]);
          }

          handleSubmit(values, { setSubmitting });
        }}
      >
        {({ values, isSubmitting, handleChange, errors, touched, setFieldValue }) => (
          <Form noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="title" label="Title" fullWidth value={values.title} onChange={handleChange} error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="description" label="Description" fullWidth multiline minRows={3} value={values.description} onChange={handleChange} error={touched.description && !!errors.description} helperText={touched.description && errors.description} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField name="price" label="Price" fullWidth type="number" value={values.price} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="type" label="Type" fullWidth value={values.type} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="features.squareFeet" label="Area (sqft)" fullWidth type="number" value={values.features.squareFeet} onChange={handleChange} />
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
                  />
                </Grid>
              ))}

              <Grid item xs={6} sm={3}>
                <TextField name="features.bedrooms" label="Bedrooms" fullWidth type="number" value={values.features.bedrooms} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField name="features.bathrooms" label="Bathrooms" fullWidth type="number" value={values.features.bathrooms} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Amenities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
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
                <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>Create</Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProperty;
