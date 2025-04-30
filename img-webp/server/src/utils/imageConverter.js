'use strict';

const sharp = require('sharp');
const path = require('path');

/**
 * Checks if a file is a supported image type and converts it to WEBP if not already.
 * @param {object} file - The file object from Strapi's upload service.
 * @returns {Promise<object>} - The processed file object (original or converted to WEBP).
 */
async function convertImageToWebp(file) {
  // List of MIME types that sharp can typically read
  const SUPPORTED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/webp',
    'image/avif', // If avif is supported by sharp build
    'image/heif', // If heif is supported by sharp build
  ];

  // Check if the file is a supported image type and not already WEBP
  if (SUPPORTED_IMAGE_MIMES.includes(file.mime) && file.mime !== 'image/webp') {
    try {
      // Use sharp to convert the image buffer to WEBP format
      // We clone the buffer before processing to avoid potential issues
      const webpBuffer = await sharp(Buffer.from(file.buffer))
        .webp({ quality: 80 }) // You can adjust the quality
        .toBuffer();

      // Construct the new file name with .webp extension
      const fileNameWithoutExt = path.parse(file.name).name;
      const webpFileName = `${fileNameWithoutExt}.webp`;

      // Log a success message
      strapi.log.info(`img-webp plugin: Converted "${file.name}" to WEBP.`);

      // Return updated file details for the WEBP version
      return {
        buffer: webpBuffer,
        size: Buffer.byteLength(webpBuffer),
        mime: 'image/webp',
        ext: '.webp',
        name: webpFileName,
        // Keep other original file properties like hash, etc.
        // Strapi's upload service will handle saving these.
        ...file,
      };

    } catch (error) {
      // Log the error and return the original file so the upload doesn't fail
      strapi.log.error(`img-webp plugin: Failed to convert image "${file.name}" to WEBP: ${error.message}`);
      return file; // Return original file on error
    }
  }

  // Return the original file if it's not a supported image type or is already WEBP
  return file;
}

module.exports = {
  convertImageToWebp,
};
