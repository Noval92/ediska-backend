const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dindf5yc1',
  api_key: '472351222283944',
  api_secret: 'rXCdxh6l9mBSB5qFz-Hht9uuAkk'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ediska_upload',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'auto'
  }
});

module.exports = { cloudinary, storage };
