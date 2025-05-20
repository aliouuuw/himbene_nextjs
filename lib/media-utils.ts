export const isVideoFile = (fileName: string | undefined | null): boolean => {
  if (!fileName) return false;
  // List of common video extensions
  return fileName.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) !== null;
};
