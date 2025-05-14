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
        method: 'GET',
        path: '/files', // Or any path you prefer for your plugin's endpoint
        handler: 'controller.fetchAllImages',
        config: {
          policies: [],
          auth: false, // Adjust authentication as needed
        },
      },
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
      },
      {
        method: 'POST',
        path: '/auto-webp',
        handler: 'controller.autoWebp',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'POST',
        path: '/set-auto-convert',
        handler: 'controller.setAutoConvert',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'GET',
        path: '/get-auto-convert',
        handler: 'controller.getAutoConvert',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'POST',
        path: '/selected-files',
        handler: 'controller.setSelectedFiles',
        config: {
          policies: [],
          auth: false
        }
      },
      {
        method: 'GET',
        path: '/selected-files',
        handler: 'controller.getSelectedFiles',
        config: {
          policies: [],
          auth: false
        }
      },
    ]
  }
};
