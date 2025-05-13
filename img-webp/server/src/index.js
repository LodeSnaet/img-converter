// server/src/index.js
import bootstrap from './bootstrap';
import destroy from './destroy';
import register from './register';

import config from './config';
import contentTypes from './content-types';
import createControllersObject from './controllers';
import middlewares from './middlewares';
import policies from './policies';
import routes from './routes'; // This must now be an array
import services from './services';
import utils from './utils';

export default ({ strapi }) => {

  return {
    register,
    bootstrap,
    destroy,

    config,
    contentTypes,

    controllers: createControllersObject({ strapi }),
    routes, // ✅ this is now an array
    services,
    policies,
    middlewares,
  };
};
