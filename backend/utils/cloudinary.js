const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload single image to Cloudinary
exports.uploadImage = async (filePath, folder = 'subscribify') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good'
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Upload multiple images to Cloudinary
exports.uploadMultipleImages = async (files, folder = 'subscribify') => {
  try {
    const uploadPromises = files.map(file => 
      cloudinary.uploader.upload(file.path, {
        folder: folder,
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto:good'
      })
    );

    const results = await Promise.all(uploadPromises);

    // Delete local files after upload
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return results.map(result => ({
      public_id: result.public_id,
      url: result.secure_url
    }));
  } catch (error) {
    // Delete local files if upload fails
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new Error(`Images upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Delete multiple images from Cloudinary
exports.deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Images deletion failed: ${error.message}`);
  }
};