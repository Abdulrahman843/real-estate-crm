import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Grid, TextField, Button, CircularProgress, Typography, Chip, Box
} from '@mui/material';

const amenitiesOptions = [
  'Pool', 'Garage', 'Garden', 'Balcony', 'Security System',
  'Air Conditioning', 'Heating', 'Furnished', 'Parking', 'Gym',
  'Storage', 'Elevator', 'Pet Friendly'
];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').positive('Must be positive'),
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
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched, setFieldValue }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && !!errors.title}
                helperText={touched.title && errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && !!errors.description}
                helperText={touched.description && errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price && !!errors.price}
                helperText={touched.price && errors.price}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.type && !!errors.type}
                helperText={touched.type && errors.type}
              />
            </Grid>

            {/* Location Fields */}
            {['address', 'city', 'state', 'zipCode', 'country'].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={`location.${field}`}
                  value={values.location[field] || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.location?.[field] && !!errors.location?.[field]}
                  helperText={touched.location?.[field] && errors.location?.[field]}
                />
              </Grid>
            ))}

            {/* Optional: Display lat/lng */}
            <Grid item xs={6} sm={3}>
              <TextField
                label="Latitude"
                value={values.location.lat || ''}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Longitude"
                value={values.location.lng || ''}
                fullWidth
                disabled
              />
            </Grid>

            {/* Features */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="features.bedrooms"
                type="number"
                value={values.features.bedrooms}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.features?.bedrooms && !!errors.features?.bedrooms}
                helperText={touched.features?.bedrooms && errors.features?.bedrooms}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="features.bathrooms"
                type="number"
                value={values.features.bathrooms}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.features?.bathrooms && !!errors.features?.bathrooms}
                helperText={touched.features?.bathrooms && errors.features?.bathrooms}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Square Feet"
                name="features.squareFeet"
                type="number"
                value={values.features.squareFeet}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.features?.squareFeet && !!errors.features?.squareFeet}
                helperText={touched.features?.squareFeet && errors.features?.squareFeet}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenitiesOptions.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    clickable
                    color={values.features.amenities.includes(amenity) ? 'primary' : 'default'}
                    onClick={() => {
                      const updated = values.features.amenities.includes(amenity)
                        ? values.features.amenities.filter((a) => a !== amenity)
                        : [...values.features.amenities, amenity];
                      setFieldValue('features.amenities', updated);
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {DraggableMap && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">Select Location on Map</Typography>
                <DraggableMap setFieldValue={setFieldValue} />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : isEditMode ? 'Update Property' : 'Add Property'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default PropertyForm;
