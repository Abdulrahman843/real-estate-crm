const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * ✅ Validate image type and size
 * @param {File} file
 * @throws Error if invalid
 */
export const validateImage = (file) => {
  if (!file || !file.type || !ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Max is 5MB.');
  }
  return true;
};

/**
 * ✅ Compress image (optional before upload)
 * @param {File} file
 * @returns {Promise<File>}
 */
export const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Failed to compress image.'));
            }
          },
          file.type,
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression.'));
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

/**
 * ✅ Process image list with validation + compression
 * @param {FileList|File[]} files
 * @param {Function} [onProgress]
 * @returns {Promise<File[]>}
 */
export const processImages = async (files, onProgress) => {
  const processed = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    try {
      const file = files[i];
      validateImage(file);
      const compressed = await compressImage(file);
      processed.push(compressed);
      if (onProgress) {
        onProgress(((i + 1) / total) * 100);
      }
    } catch (err) {
      throw new Error(`Error processing ${files[i].name}: ${err.message}`);
    }
  }

  return processed;
};

/**
 * ✅ Preview object URL
 * @param {File} file
 * @returns {string}
 */
export const createImagePreview = (file) => {
  try {
    return URL.createObjectURL(file);
  } catch {
    throw new Error('Failed to generate image preview.');
  }
};

/**
 * ✅ Revoke object URL (cleanup)
 * @param {string} url
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * ☁️ Upload to Cloudinary (optional)
 * @param {File} file
 * @returns {Promise<Object>} { secure_url, public_id, etc. }
 */
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // change this
  const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Cloudinary upload failed');
  }

  return await res.json(); // contains secure_url, public_id, etc.
};
