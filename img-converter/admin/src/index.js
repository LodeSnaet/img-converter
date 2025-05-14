import { PLUGIN_ID } from './pluginId'; // Assuming you have a pluginId.js file exporting your plugin's ID
import { Initializer } from './components/Initializer';


export default {
  register(app) {
    app.createSettingSection(
      {
        id: `${PLUGIN_ID}-section`,
        intlLabel: {
          id: `${PLUGIN_ID}.settings.section.label`,
          defaultMessage: 'IMG-WEBP',    // human‑readable fallback
        },
      },
      [
        {
          id: `${PLUGIN_ID}-link`,
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.name`,
            defaultMessage: 'Img-Webp',
          },
          to: `/settings/${PLUGIN_ID}`,          // ← this must match
          Component: async () => import('./pages/App'),
        },
      ]
    );

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      name: PLUGIN_ID
    });
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
    return Promise.resolve(importedTrads)
  },
};
