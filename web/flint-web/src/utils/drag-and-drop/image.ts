const ImageFileTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/apng",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/avif",
  "image/tiff",
];


export function isSupportedImageType(file: File): boolean {
  return ImageFileTypes.includes(file.type);
}
