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
        path: '/files',
        handler: 'controller.getFiles',
        config: {
          policies: [],
          auth: {
            scope: ['admin::isAuthenticated']
          },
          description: 'Retrieve all image files for batch conversion',
          tag: {
            plugin: 'img-webp',
            name: 'getFiles',
            actionType: 'read'
          }
        }
      },
      {
        method: 'POST',
        path: '/files/:id/convert',
        handler: 'controller.convertSingleFile',
        config: {
          policies: [],
          auth: {
            scope: ['admin::isAuthenticated']
          },
          description: 'Convert a single file to WebP format',
          tag: {
            plugin: 'img-webp',
            name: 'convertFile',
            actionType: 'update'
          }
        }
      },
      {
        method: 'POST',
        path: '/process-batch',
        handler: 'controller.processBatchFiles',
        config: {
          policies: [],
          auth: {
            scope: ['admin::isAuthenticated']
          },
          description: 'Process and convert multiple files to WebP format',
          tag: {
            plugin: 'img-webp',
            name: 'processBatch',
            actionType: 'update'
          }
        }
      }
    ]
  }
};
