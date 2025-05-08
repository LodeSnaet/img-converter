// server/src/routes/index.js
export default {
  'content-api': {
    type: 'content-api',
    routes: []
  },
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/files',
        handler: 'myController.batchConverter',
        config: {
          policies: [],
          auth: {
            scope: ['admin']
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
        handler: 'myController.convertSingleFile',
        config: {
          policies: [],
          auth: {
            scope: ['admin']
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
        handler: 'myController.processBatchFiles',
        config: {
          policies: [],
          auth: {
            scope: ['admin']
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
