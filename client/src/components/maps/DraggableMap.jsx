// client/src/components/maps/DraggableMap.jsx

import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { CircularProgress, Box } from '@mui/material';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '350px'
};

const defaultCenter = {
  lat: 51.0802, // Barnstaple latitude
  lng: -4.0607  // Barnstaple longitude
};

const DraggableMap = ({ setFieldValue }) => {
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });

    try {
      const { data } = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      const result = data.results[0];
      if (result) {
        const getComponent = (type) =>
          result.address_components.find((c) => c.types.includes(type))?.long_name || '';

        setFieldValue('location.address', result.formatted_address);
        setFieldValue('location.city', getComponent('locality'));
        setFieldValue('location.state', getComponent('administrative_area_level_1'));
        setFieldValue('location.zipCode', getComponent('postal_code'));
        setFieldValue('location.country', getComponent('country'));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  }, [setFieldValue]);

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={14}
        onLoad={(map) => (mapRef.current = map)}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} draggable onDragEnd={handleMapClick} />
      </GoogleMap>
    </Box>
  );
};

export default DraggableMap;
