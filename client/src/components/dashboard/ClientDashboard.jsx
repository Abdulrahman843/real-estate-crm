import { Grid, Typography, Paper, Chip } from '@mui/material';

const ClientDashboard = ({ data }) => {
  const renderFavoriteProperties = () => {
    if (!data.recentListings?.length) {
      return <Typography>No favorites yet</Typography>;
    }

    return data.recentListings.map((fav, i) => (
      <Typography key={i} variant="body2">
        {fav.title} - £{fav.price?.toLocaleString()}
      </Typography>
    ));
  };

  const renderPropertyTypes = () => {
    if (!data.propertyTypes?.length) {
      return <Typography>No data</Typography>;
    }

    return data.propertyTypes.map((type, i) => (
      <Chip
        key={i}
        label={`${type.type} (${type.count})`}
        sx={{ m: 0.5 }}
      />
    ));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Client Overview</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Favorite Properties
          </Typography>
          {renderFavoriteProperties()}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Property Types
          </Typography>
          {renderPropertyTypes()}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ClientDashboard;