const multer = require("multer");
const multerStorageCloudinary = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const CloudinaryStorage =
  multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rajdhani-dry-food/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;