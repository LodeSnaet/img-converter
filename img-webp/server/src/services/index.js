'use strict';

// Import the utility function from your imageConverter.js file
const { convertImageToWebp } = require('../utils/imageConverter');

/**
 * Custom upload service to intercept file uploads and convert images to WEBP.
 * This function acts as a factory that returns the service object.
 * @param {object} params - Parameters including the Strapi instance.
 * @param {Strapi} params.strapi - The Strapi application instance.
 * @returns {object} - The custom upload service methods.
 */
const customUploadService = ({ strapi }) => ({

  /**
   * Overrides or wraps the default upload service's upload method.
   * @param {Array<object>} files - An array of file objects to upload.
   * @param {object} [config] - Configuration options for the upload.
   * @returns {Promise<Array<object> | object>} - The result from the original upload service.
   */
  async upload(files, config) {
    // Get the original upload service from the built-in plugin
    const originalUploadService = strapi.plugins.upload.services.upload;

    if (!originalUploadService) {
      strapi.log.error('img-webp plugin: Original upload service not found.');
      // Depending on desired behavior, you might throw an error or return null/empty.
      throw new Error('Original upload service not available.');
    }

    // Ensure files is an array, even if a single file is uploaded
    const filesArray = Array.isArray(files) ? files : [files];

    // Process each file using the convertImageToWebp utility function
    const processedFiles = await Promise.all(filesArray.map(async file => {
      // convertImageToWebp handles checking if conversion is needed
      return convertImageToWebp(file);
    }));

    // Call the original upload service's upload method with the processed files
    // This will handle the actual saving of the files to your chosen provider (local, S3, etc.)
    // and creating the entries in Strapi's media library.
    try {
      const uploadResult = await originalUploadService.upload(processedFiles, config);
      strapi.log.info('img-webp plugin: Files processed and sent to original upload service.');
      return uploadResult;
    } catch (error) {
      strapi.log.error(`img-webp plugin: Error during original upload service call: ${error.message}`);
      throw error; // Re-throw the error so Strapi handles it
    }
  },

  // You might need to override other methods from the original upload service
  // if your plugin's functionality requires it. For example:
  // async uploadToProvider(file, config) { ... }
  // async isImage(file) { ... }
  // async enhanceAndValidateFile(file, config) { ... }
});

module.exports = {
  // Export your custom upload service so it can be used in register.js
  customUploadService,

  // If you have a default service.js file with other services you want to expose
  // from your plugin, you would export them here as well:
  // defaultService: require('./service'),
};
