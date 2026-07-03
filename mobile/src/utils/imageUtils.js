import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

/**
 * Gets the dimensions of a local image URI.
 */
const getImageSize = (uri) => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

/**
 * Compresses and resizes an image for upload.
 * Max width: 1080px (preserves aspect ratio)
 * Quality: 0.7 (70% JPEG compression)
 * @param {string} uri - The local URI of the image
 * @returns {Promise<string>} The new local URI of the compressed image
 */
export const compressImageForUpload = async (uri) => {
  try {
    const { width } = await getImageSize(uri);

    const actions = [];
    
    // Only resize if the image is wider than 1080px to prevent upscaling
    if (width > 1080) {
      // Providing only width preserves the aspect ratio automatically
      actions.push({ resize: { width: 1080 } });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};
