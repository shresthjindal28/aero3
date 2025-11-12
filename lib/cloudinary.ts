import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl = process.env.CLOUDINARY_URL;

// Warn in development if CLOUDINARY_URL is missing
if (!cloudinaryUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "Missing CLOUDINARY_URL. Set CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME in .env.local"
  );
}

// Configure Cloudinary to use secure URLs; SDK reads CLOUDINARY_URL automatically
cloudinary.config({ secure: true });

export default cloudinary;