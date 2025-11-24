const DEFAULT_GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DEFAULT_ASPECT_RATIO = process.env.GEMINI_IMAGE_ASPECT_RATIO || null;
const DEFAULT_IMAGE_SIZE = process.env.GEMINI_IMAGE_SIZE || null;

const buildImageConfig = ({ aspectRatio, imageSize } = {}) => {
  const config = {};

  const ratio = aspectRatio || DEFAULT_ASPECT_RATIO;
  if (ratio) {
    config.aspectRatio = ratio;
  }

  const size = imageSize || DEFAULT_IMAGE_SIZE;
  if (size) {
    config.imageSize = size;
  }

  return Object.keys(config).length ? config : undefined;
};

module.exports = {
  DEFAULT_GEMINI_IMAGE_MODEL,
  buildImageConfig
};
