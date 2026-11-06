import cloudinary from "../configs/cloudinary.config.js";

export const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "hotel-pms/rooms",
    resource_type: "image",
  });

  return {
    image_url: result.secure_url,
    image_public_id: result.public_id,
  };
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId);
};
