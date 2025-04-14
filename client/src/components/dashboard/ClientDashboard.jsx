import { Grid, Typography, Paper, Chip } from '@mui/material';

const ClientDashboard = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><Typography variant="h5">Client Overview</Typography></Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Favorite Properties</Typography>
          {data.recentListings?.length > 0 ? data.recentListings.map((fav, i) => (
            <Typography key={i} variant="body2">{fav.title} - £{fav.price}</Typography>
          )) : <Typography>No favorites yet</Typography>}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Property Types</Typography>
          {data.propertyTypes?.length > 0 ? data.propertyTypes.map((type, i) => (
            <Chip key={i} label={`${type.type} (${type.count})`} sx={{ m: 0.5 }} />
          )) : <Typography>No data</Typography>}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ClientDashboard;
