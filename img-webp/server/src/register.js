'use strict';

const { customUploadService } = require('./services');
const registerConvertToWebpCommand = require('./services/convert-webp'); // Import the commands registration

module.exports = ({ strapi }) => {
  // 1. Register the custom upload service override
  const uploadPlugin = strapi.plugins.upload;

  if (uploadPlugin && uploadPlugin.services) {
    uploadPlugin.services.upload = customUploadService({ strapi });
    strapi.log.info('img-webp plugin: Successfully registered custom upload service.');
  } else {
    strapi.log.warn('img-webp plugin: Could not find the built-in upload plugin or its services. WEBP conversion will not be applied to new uploads.');
  }

  // 2. Register the custom commands
  registerConvertToWebpCommand({ strapi });
  strapi.log.info('img-webp plugin: Registered convert-existing commands.');
};
