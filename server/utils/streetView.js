const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getStreetViewImage = (address) => {
    const baseUrl = "https://maps.googleapis.com/maps/api/streetview";
    const params = new URLSearchParams({
      size: "800x600",
      location: address,
      key: process.env.GOOGLE_MAPS_API_KEY
    });
  
    return `${baseUrl}?${params.toString()}`;
  };
  
  module.exports = getStreetViewImage;
  