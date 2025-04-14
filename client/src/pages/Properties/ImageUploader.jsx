import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Grid, Typography, IconButton, Button, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { compressImage, createImagePreview, revokeImagePreview, validateImage } from '../../utils/imageUpload';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

// eslint-disable-next-line no-unused-vars
const ImageUploader = ({ propertyId, onUploadSuccess }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length + images.length > 5) {
      alert('Max 5 images allowed.');
      return;
    }
    const newImages = [];
    for (let file of acceptedFiles) {
      try {
        validateImage(file);
        const compressed = await compressImage(file);
        const preview = createImagePreview(compressed);
        newImages.push({ file: compressed, preview });
      } catch (err) {
        alert(err.message);
      }
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const removeImage = (index) => {
    revokeImagePreview(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    setUploading(true);
    const formData = new FormData();
    try {
      const uploadResults = [];
      for (let img of images) {
        formData.set('file', img.file);
        formData.set('upload_preset', uploadPreset);
        formData.set('folder', 'real-estate-crm');

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        uploadResults.push({
          url: data.secure_url,
          public_id: data.public_id,
          thumbnail: data.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
        });
      }

      setUploadedImages(uploadResults);
      setImages([]);
      if (onUploadSuccess) onUploadSuccess(uploadResults);
      alert('Upload successful');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => images.forEach(img => revokeImagePreview(img.preview));
  }, [images]);

  return (
    <Box sx={{ border: '2px dashed #ccc', p: 2, mt: 3 }}>
      <Box {...getRootProps()} sx={{ cursor: 'pointer', textAlign: 'center' }}>
        <input {...getInputProps()} />
        <Typography variant="body1">
          Drag & drop or click to select images (max 5)
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {images.map((img, index) => (
          <Grid item key={index}>
            <Box position="relative">
              <img
                src={img.preview}
                alt="preview"
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
              />
              <IconButton
                onClick={() => removeImage(index)}
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={uploadImages}
        disabled={images.length === 0 || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? <CircularProgress size={20} /> : 'Upload Images'}
      </Button>

      {uploadedImages.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Uploaded Images:</Typography>
          <Grid container spacing={2}>
            {uploadedImages.map((img, i) => (
              <Grid item key={i}>
                <img
                  src={img.thumbnail}
                  alt={`uploaded-${i}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
