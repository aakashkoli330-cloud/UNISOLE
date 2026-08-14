import { CLOUDINARY_BASE_URL, PLACEHOLDER_IMAGE } from "../config";

export function getImageSrc(image) {
  if (!image || image === "null" || image === "undefined") return PLACEHOLDER_IMAGE;
  if (image.startsWith("http")) return image;
  if (image.includes("cloudinary")) return image;
  if (image.includes("/")) return `${CLOUDINARY_BASE_URL}/${image}`;
  return `/images/${image}`;
}
