import React from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const PropertyMap = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = React.useState(null);
  const mapCenter = { lat: 51.0797, lng: -4.0627 }; // Barnstaple, UK coordinates

  return (
    <GoogleMap
      zoom={12}
      center={mapCenter}
      mapContainerStyle={{ width: '100%', height: '400px' }}
    >
      {properties.map(property => (
        <Marker
          key={property._id}
          position={{ lat: property.latitude, lng: property.longitude }}
          onClick={() => setSelectedProperty(property)}
        />
      ))}
      
      {selectedProperty && (
        <InfoWindow
          position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div>
            <h3>{selectedProperty.title}</h3>
            <p>${selectedProperty.price}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default PropertyMap;