import React, { useRef, useState } from 'react';
import {
  Box, Typography, Button, IconButton, Grid, CircularProgress
} from '@mui/material';
import { Upload, Delete } from '@mui/icons-material';
import { processImages, createImagePreview, revokeImagePreview } from '../../utils/imageUpload';
import { propertyService } from '../../services/propertyService';

const ImageUploader = ({ propertyId, onUploadSuccess }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFiles = async (files) => {
    try {
      const processed = await processImages(files);
      const newPreviews = processed.map(createImagePreview);

      setImages(prev => [...prev, ...processed]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Upload error:', error.message);
      alert(error.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).slice(0, 5 - images.length);
    handleFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    handleFiles(files);
  };

  const handleDelete = (index) => {
    revokeImagePreview(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!propertyId || images.length === 0) return;

    setUploading(true);
    try {
      const response = await propertyService.uploadImages(propertyId, images);
      alert('Images uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess(response);
      setImages([]);
      previews.forEach(revokeImagePreview);
      setPreviews([]);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        border: '2px dashed gray',
        p: 2,
        borderRadius: 2,
        textAlign: 'center',
        position: 'relative',
        mt: 3,
      }}
    >
      <Typography variant="h6">Upload Property Images</Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Upload />}
        onClick={() => fileInputRef.current.click()}
        sx={{ mt: 2 }}
        disabled={images.length >= 5}
      >
        Select Images (Max 5)
      </Button>

      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {previews.map((url, index) => (
          <Grid item xs={4} sm={3} key={index}>
            <Box sx={{ position: 'relative' }}>
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100%',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <IconButton
                onClick={() => handleDelete(index)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#f44336', color: 'white' }
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {images.length > 0 && (
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload Images'}
        </Button>
      )}
    </Box>
  );
};

export default ImageUploader;
