// 'use strict';
//
// const { convertImageToWebp } = require('../utils/imageConverter');
// const fs = require('fs').promises;
// const path = require('path');
//
// const streamToBuffer = async (stream) => {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on('data', (chunk) => chunks.push(chunk));
//     stream.on('end', () => resolve(Buffer.concat(chunks)));
//     stream.on('error', reject);
//   });
// };
//
// module.exports = ({ strapi }) => ({
//   async convertAllImagesToWebp() {
//     const imagesToConvert = await strapi.entityService.findMany('plugin::upload.file', {
//       filters: {
//         mime: {
//           $startsWith: 'image/',
//           $notIn: ['image/svg+xml', 'image/gif', 'image/webp'],
//         },
//       },
//     });
//
//     const uploadProviderService = strapi.plugin('upload').provider;
//
//     for (const image of imagesToConvert) {
//       let fileBuffer;
//
//       try {
//         if (uploadProviderService.downloadStream) {
//           const downloadStream = uploadProviderService.downloadStream(image);
//           fileBuffer = await streamToBuffer(downloadStream);
//         } else if (uploadProviderService.read) {
//           fileBuffer = await uploadProviderService.read(image);
//         } else {
//           const filePath = path.join(strapi.config.paths.public, image.url.replace('/uploads/', ''));
//           fileBuffer = await fs.readFile(filePath);
//         }
//
//         const fileObject = { ...image, buffer: fileBuffer };
//         const processedFile = await convertImageToWebp(fileObject);
//
//         if (processedFile.mime === 'image/webp' && processedFile.buffer !== fileBuffer) {
//           await uploadProviderService.delete(image);
//
//           const uploaded = await strapi
//             .plugin('upload')
//             .service('upload')
//             .upload(processedFile);
//
//           const newFile = uploaded[0];
//
//           await strapi.entityService.update('plugin::upload.file', image.id, {
//             data: {
//               name: newFile.name,
//               hash: newFile.hash,
//               ext: newFile.ext,
//               mime: newFile.mime,
//               size: newFile.size,
//               url: newFile.url,
//             },
//           });
//         }
//       } catch (err) {
//         strapi.log.error(`img-webp error: ${err.message}`);
//       }
//     }
//
//     return { status: 'done' };
//   },
// });
