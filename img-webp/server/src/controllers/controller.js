const createControllerMethods = ({ strapi }) => ({
  // Existing method
  index(ctx) {
    ctx.body = strapi
      .plugin('img-webp')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  }
});

export default createControllerMethods;
