const createControllerMethods = ({ strapi }) => ({
  // Existing method
  index(ctx) {
    ctx.body = strapi
      .plugin('img-webp')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },


  async getFiles(ctx) {
    try {
      console.log('getFiles controller hit');
    } catch (err) {
      ctx.throw(500, 'Fout bij ophalen bestanden');
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

// Helper functie voor bestandstype bepaling
const determineFileType = (mime) => {
  const mimeTypes = {
    'image/svg+xml': 'SVG',
    'image/png': 'PNG',
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/webp': 'WEBP',
    'image/gif': 'GIF'
  };
  return mimeTypes[mime] || 'OTHER';
};

// Export the function that creates the controller methods object
export default createControllerMethods;
