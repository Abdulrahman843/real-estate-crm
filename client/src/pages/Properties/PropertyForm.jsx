import React from 'react';
import { Formik, Form } from 'formik';
import { TextField, Button, Grid } from '@mui/material';
import * as Yup from 'yup';

const PropertyForm = () => {
  const initialValues = {
    title: '',
    description: '',
    price: '',
    location: '',
    type: ''
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    price: Yup.number().required('Required').positive('Must be positive'),
    location: Yup.string().required('Required'),
    type: Yup.string().required('Required')
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="price"
                label="Price"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.location && Boolean(errors.location)}
                helperText={touched.location && errors.location}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Add Property
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default PropertyForm;