// real-estate-crm/client/src/components/properties/PropertyCard.jsx

import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Box, IconButton, Chip
} from '@mui/material';
import {
  Edit, Delete, LocationOn, Hotel,
  Bathtub, SquareFoot, Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property, role, onShare, onDelete, onImageClick }) => {
  const navigate = useNavigate();

  const {
    _id,
    title,
    price,
    images,
    location,
    features = {}
  } = property;

  const handleView = () => navigate(`/properties/${_id}`);
  const handleEdit = () => navigate(`/properties/edit/${_id}`);

  return (
    <Card sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={handleView}>
      <CardMedia
        component="img"
        height="200"
        image={images?.[0]?.url || '/placeholder-property.jpg'}
        alt={title}
        onClick={(e) => {
          e.stopPropagation();
          onImageClick && onImageClick(images?.[0]?.url);
        }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>{title}</Typography>
        <Typography variant="h5" color="primary" gutterBottom>£{(price || 0).toLocaleString()}</Typography>

        <Box display="flex" alignItems="center" mb={1}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {[location?.address, location?.city, location?.state].filter(Boolean).join(', ')}
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip size="small" icon={<Hotel />} label={`${features.bedrooms || 0} Beds`} />
          <Chip size="small" icon={<Bathtub />} label={`${features.bathrooms || 0} Baths`} />
          <Chip size="small" icon={<SquareFoot />} label={`${features.squareFeet || 0} sq ft`} />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" onClick={(e) => { e.stopPropagation(); handleView(); }}>
          View Details
        </Button>

        <Box>
          <IconButton size="small" onClick={(e) => onShare(property, e)}>
            <Share />
          </IconButton>

          {['admin', 'agent'].includes(role) && (
            <>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                <Edit />
              </IconButton>
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(_id); }}>
                <Delete />
              </IconButton>
            </>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default PropertyCard;
