// server/src/controllers/controller.js
// This file exports a function that CREATES the controller methods object.

const createControllerMethods = ({ strapi }) => ({
  // Existing method
  index(ctx) {
    ctx.body = strapi
      .plugin('img-webp')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },


  async batchConverter(ctx) {
    const uploadService = strapi.plugin('upload').service('upload');

    if (!uploadService) {
      throw new Error("Upload service unavailable");
    }

    try {
      const { results: allFiles } = await uploadService.findMany({});

      const imageFiles = allFiles
        .filter(file => file.mime && file.mime.startsWith('image/'))
        .map(file => ({
          url: file.url,
          id: file.id,
          type: determineFileType(file.mime),
          fileName: file.name
        }));

    // Gebruik ctx.send in plaats van return
    ctx.send({ data: imageFiles });
  } catch (error) {
    console.error("Error fetching files:", error);
    ctx.throw(500, "Failed to fetch image files");
  }
},

  async convertSingleFile(ctx) {
    // Logic for POST /files/:id/convert - Call your service here
    const fileId = ctx.params.id;
    console.log(`convertSingleFile controller hit for ID: ${fileId}`);
    // Example: const result = await strapi.plugin('img-webp').service('myService').convertAndReplaceFile(fileId, 'webp', ctx.state.user);
    ctx.send({ message: `convertSingleFile endpoint hit for file ID ${fileId}.` });
  },

  async processBatchFiles(ctx) {
    // Logic for POST /process-batch - Call your service here
    const fileIds = ctx.request.body.fileIds;
    console.log('processBatchFiles controller hit. IDs:', fileIds);
    // Example: const results = await strapi.plugin('img-webp').service('myService').processMultipleFiles(fileIds, 'webp', ctx.state.user);
    ctx.send({ message: 'processBatchFiles endpoint hit.' });
  },

});

// Helper functie voor het bepalen van het bestandstype
const determineFileType = (mime) => {
  switch (mime) {
    case 'image/svg+xml':
      return 'SVG';
    case 'image/png':
      return 'PNG';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPG';
    case 'image/webp':
      return 'WEBP';
    case 'image/gif':
      return 'GIF';
    default:
      return 'OTHER_IMAGE';
  }
};

// Export the function that creates the controller methods object
export default createControllerMethods;
