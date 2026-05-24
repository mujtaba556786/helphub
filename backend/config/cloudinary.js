const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: (req) => ({
        folder:         'helpmate/avatars',
        public_id:      `avatar_${req.params.id}`,
        overwrite:      true,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
    })
});

// True if Cloudinary credentials are configured
const isConfigured = () =>
    !!(process.env.CLOUDINARY_CLOUD_NAME &&
       process.env.CLOUDINARY_API_KEY &&
       process.env.CLOUDINARY_API_SECRET);

module.exports = { cloudinary, avatarStorage, isConfigured };
