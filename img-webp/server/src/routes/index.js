// server/src/routes/index.js
export default {
  'content-api': {
    type: 'content-api',
    routes: []
  },
  'admin': {
    type: 'admin',
    routes: [
      {
        method: 'POST',
        path: '/convert-to-webp',
        handler: 'controller.convertToWebp',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'POST',
        path: '/convert-to-png',
        handler: 'controller.convertToPng',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'POST',
        path: '/convert-to-jpg',
        handler: 'controller.convertToJpg',
        config: {
          policies: [],
          auth: false
        }
      }
    ]
  }
};
