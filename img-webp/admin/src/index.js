// src/plugins/img-webp/admin/src/index.jsx

import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginId from './pluginId'; // Assuming you have a pluginId.js file exporting your plugin's ID

const name = 'Image to WEBP Converter'; // Display name for your plugin

export default {
  register(app) {
    // Register the plugin itself
    app.registerPlugin({
      id: pluginId,
      name,
    });

    app.addSettingsLink('admin', { // <-- Changed from 'global'
      id: pluginId,
      Title: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      to: `/settings/${pluginId}`,
      async Component() {
        const SettingsPage = await import('./pages/Settings/index.jsx');
        return SettingsPage;
      },
    });

    // Register plugin's routes and components (if you have other admin pages)
    app.addInternalLink({
      // This might be needed to link from the main navigation if you had one,
      // but for settings, the addSettingsLink is key.
    });


    // Register middlewares, reducers etc. if needed for your admin panel
    // app.addMiddleware(...)
    // app.addReducer(...)
  },

  bootstrap(app) {
    // Bootstrap the plugin (e.g., register permissions)
    app.addPermissions([
      {
        action: 'plugin::img-webp.convert', // Define a permission action
        subject: null,
        properties: {
          uri: '/img-webp/convert-existing', // Link permission to your server route
          plugin: 'img-webp',
        },
      },
    ]);
  },

  async registerTrads(app) {
    // Register translations
    const { locales } = app;

    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
