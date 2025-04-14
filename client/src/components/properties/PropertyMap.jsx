import React, { useState, useMemo, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
  MarkerClusterer
} from '@react-google-maps/api';

const PropertyMap = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [radius, setRadius] = useState(5000); // meters
  const mapRef = useRef(null);

  const center = useMemo(() => ({ lat: 51.0797, lng: -4.0627 }), []);

  const mapOptions = {
    mapTypeId: mapType,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapTypeChange = (e) => {
    setMapType(e.target.value);
  };

  const handleRadiusChange = (e) => {
    setRadius(Number(e.target.value));
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Map Type Selector */}
      <select
        value={mapType}
        onChange={handleMapTypeChange}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 999,
          padding: 6,
          borderRadius: 4,
        }}
      >
        <option value="roadmap">Roadmap</option>
        <option value="satellite">Satellite</option>
        <option value="hybrid">Hybrid</option>
        <option value="terrain">Terrain</option>
      </select>

      {/* Radius Selector */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 10,
          zIndex: 999,
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 6,
          boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
          width: 200,
        }}
      >
        <label style={{ fontWeight: 600 }}>
          Search Radius: {Math.round(radius / 1000)} km
        </label>
        <input
          type="range"
          min="1000"
          max="20000"
          step="1000"
          value={radius}
          onChange={handleRadiusChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* Google Map */}
      <GoogleMap
        zoom={12}
        center={center}
        options={mapOptions}
        mapContainerStyle={{ width: '100%', height: '400px' }}
        onLoad={handleMapLoad}
      >
        {/* Radius Circle */}
        <Circle
          center={center}
          radius={radius}
          options={{
            fillColor: '#1976d2',
            fillOpacity: 0.1,
            strokeColor: '#1976d2',
            strokeOpacity: 0.6,
            strokeWeight: 2,
          }}
        />

        {/* Marker Clusterer from @react-google-maps/api */}
        <MarkerClusterer>
          {(clusterer) =>
            properties.map((property) => (
              <Marker
                key={property._id}
                position={{ lat: property.latitude, lng: property.longitude }}
                clusterer={clusterer}
                onClick={() => setSelectedProperty(property)}
              />
            ))
          }
        </MarkerClusterer>

        {/* Info Window */}
        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.latitude,
              lng: selectedProperty.longitude,
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div>
              <h3>{selectedProperty.title}</h3>
              <p>${selectedProperty.price.toLocaleString()}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;
