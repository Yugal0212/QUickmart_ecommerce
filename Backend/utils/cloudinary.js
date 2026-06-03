const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer) => {
  if (!fileBuffer) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        timeout: 60000 // 60 seconds timeout
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return resolve(null); // Return null instead of rejecting to allow other images to upload
        }
        return resolve(result.secure_url);
      }
    );

    // Handle stream errors
    uploadStream.on('error', (err) => {
      console.error('Upload Stream Error:', err);
      resolve(null);
    });

    uploadStream.end(fileBuffer);
  });
};
module.exports = { uploadOnCloudinary };