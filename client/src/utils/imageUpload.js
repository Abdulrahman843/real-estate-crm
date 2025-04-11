const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates if the uploaded image meets type and size requirements.
 * @param {File} file - The image file to validate.
 * @throws Will throw an error if the file is invalid.
 */
export const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
  return true;
};

/**
 * Compresses an image to a maximum width/height and quality.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - A compressed image file.
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
        let width = img.width;
        let height = img.height;

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
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8
        );
      };
    };

    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
};

/**
 * Processes multiple images with validation and compression.
 * @param {FileList} files - Array of files to process.
 * @param {Function} [onProgress] - Optional callback for upload progress.
 * @returns {Promise<File[]>} - Array of processed image files.
 */
export const processImages = async (files, onProgress) => {
  const processedFiles = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    try {
      validateImage(files[i]);
      const compressed = await compressImage(files[i]);
      processedFiles.push(compressed);

      if (onProgress) {
        onProgress(((i + 1) / total) * 100);
      }
    } catch (err) {
      throw new Error(`Error processing ${files[i].name}: ${err.message}`);
    }
  }

  return processedFiles;
};

/**
 * Creates an object URL for image preview.
 * @param {File} file - Image file.
 * @returns {string} - Object URL for the image.
 */
export const createImagePreview = (file) => {
  try {
    return URL.createObjectURL(file);
  } catch {
    throw new Error('Failed to create image preview');
  }
};

/**
 * Cleans up object URLs to prevent memory leaks.
 * @param {string} url - Object URL to revoke.
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
