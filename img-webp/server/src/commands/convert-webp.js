'use strict';

const { convertImageToWebp } = require('../utils/imageConverter');
const fs = require('fs').promises; // Use promise version of fs
const path = require('path');

// Helper function to read a stream into a buffer
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = ({ strapi }) => {
  // Define your custom commands
  strapi.cli.injectCommand(async ({ program }) => {
    program
      .command('img-webp:convert-existing')
      .description('Converts existing uploaded images (excluding SVG and GIF) to WEBP format.')
      .action(async () => {
        strapi.log.info('Starting conversion of existing images to WEBP...');

        try {
          // 1. Find existing image files in the Media Library
          // We need to filter out SVGs and GIFs as requested, and also WEBP files
          const imagesToConvert = await strapi.entityService.findMany('plugin::upload.file', {
            filters: {
              mime: {
                $startsWith: 'image/',
                $notIn: ['image/svg+xml', 'image/gif', 'image/webp'],
              },
            },
          });

          if (imagesToConvert.length === 0) {
            strapi.log.info('No existing images found that need conversion to WEBP.');
            return;
          }

          strapi.log.info(`Found ${imagesToConvert.length} images to potentially convert.`);

          // Get the upload provider service
          const uploadProviderService = strapi.plugin('upload').provider; // Access the configured provider

          if (!uploadProviderService) {
            strapi.log.error('Upload provider service not found.');
            return;
          }


          // 2. Iterate and convert each image
          for (const image of imagesToConvert) {
            try {
              strapi.log.info(`Processing image: ${image.name} (id: ${image.id})`);

              // Fetch the file buffer from the upload provider
              // This part might vary slightly depending on the provider
              // For local provider, you might read from the file system.
              // For providers like S3, you'd use the provider's download method.
              let fileBuffer;
              if (uploadProviderService.downloadStream) {
                // If provider supports streaming download
                const downloadStream = uploadProviderService.downloadStream(image);
                fileBuffer = await streamToBuffer(downloadStream);

              } else if (uploadProviderService.read) {
                // If provider supports reading (less common for large files)
                fileBuffer = await uploadProviderService.read(image);
              } else {
                // Fallback for local provider or similar by reading from disk path
                // Ensure the image.url is a local path if using local provider
                const filePath = path.join(strapi.config.paths.public, image.url.replace('/uploads/', '')); // Adjust path as needed
                fileBuffer = await fs.readFile(filePath);
                strapi.log.debug(`Read file from local path: ${filePath}`);
              }


              if (!fileBuffer) {
                strapi.log.warn(`Could not retrieve file buffer for image: ${image.name} (id: ${image.id}). Skipping.`);
                continue;
              }


              // Create a file object similar to what the upload service handles
              const fileObject = {
                name: image.name,
                alternativeText: image.alternativeText,
                caption: image.caption,
                hash: image.hash,
                ext: image.ext,
                mime: image.mime,
                size: image.size,
                buffer: fileBuffer,
                url: image.url,
                provider: image.provider,
                provider_metadata: image.provider_metadata,
              };


              // Use your utility to convert the image
              const processedFile = await convertImageToWebp(fileObject);


              // Check if the image was actually converted (i.e., it wasn't already WEBP and conversion succeeded)
              if (processedFile.mime === 'image/webp' && processedFile.buffer !== fileObject.buffer) {

                strapi.log.info(`Converting and updating image: ${image.name} (id: ${image.id})`);

                // Upload the new WEBP file, potentially replacing the old one
                // This requires interacting with the upload provider.
                // The exact method depends on the provider.
                // A common approach is to delete the old file and upload the new one,
                // or update the existing file if the provider supports it.
                // For simplicity here, we'll demonstrate a basic approach
                // which might need adjustment based on your provider config.

                // Option A: Delete original and upload new (might lose original file if needed)
                // await uploadProviderService.delete(image);
                // const uploadedWebpImage = await uploadProviderService.upload(processedFile);
                // const newFileId = uploadedWebpImage.id; // Get the ID of the newly uploaded file

                // Option B: Update the existing file entry and potentially replace the file data
                // This is more complex and depends heavily on provider capabilities.
                // A simpler approach that works with most providers is to just update the database entry
                // if the provider automatically handles file replacement based on identifier (less common).

                // A more reliable approach that works with standard providers:
                // Delete the old file from the provider
                try {
                  await uploadProviderService.delete(image);
                  strapi.log.debug(`Deleted original file from provider: ${image.url}`);
                } catch (deleteError) {
                  strapi.log.warn(`Could not delete original file from provider for image: ${image.name} (id: ${image.id}). Error: ${deleteError.message}`);
                  // Continue with upload attempt even if delete fails
                }


                // Upload the new WEBP file using the provider
                const uploadedWebpImageArray = await strapi.plugin('upload').service('upload').upload(processedFile);
                const uploadedWebpImage = uploadedWebpImageArray[0]; // The upload service returns an array


                // Update the Strapi database entry for the original image
                // to reflect the new WEBP file details.
                await strapi.entityService.update('plugin::upload.file', image.id, {
                  data: {
                    name: uploadedWebpImage.name,
                    hash: uploadedWebpImage.hash, // Update hash as content changed
                    ext: uploadedWebpImage.ext,
                    mime: uploadedWebpImage.mime,
                    size: uploadedWebpImage.size,
                    url: uploadedWebpImage.url,
                    // Keep other metadata like alternativeText, caption, provider etc.
                  },
                });

                strapi.log.info(`Successfully converted and updated image: ${image.name} (id: ${image.id}) to WEBP.`);

              } else {
                strapi.log.info(`Image "${image.name}" (id: ${image.id}) did not need conversion or conversion failed.`);
              }

            } catch (conversionError) {
              strapi.log.error(`Error processing image ${image.name} (id: ${image.id}): ${conversionError.message}`);
            }
          }

          strapi.log.info('Image conversion process finished.');

        } catch (error) {
          strapi.log.error(`An error occurred during the conversion command: ${error.message}`);
        }
      });
  });
};
