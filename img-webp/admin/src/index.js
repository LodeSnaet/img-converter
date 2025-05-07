import { PLUGIN_ID } from './pluginId'; // Assuming you have a pluginId.js file exporting your plugin's ID
import { Initializer } from './components/Initializer';
// PluginIcon is typically used for the main menu link icon,
// but you can optionally use it for the settings link icon too.

// Import your main App component that handles routing for your plugin's UI
// We will dynamically import this component later in the Component function
// import App from './pages/App';

const name = 'Hello there'; // Display name for your plugin (used in intlLabel)

export default {
  register(app) {
    app.registerPlugin({ id: PLUGIN_ID, initializer: Initializer, name: PLUGIN_ID });

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
  },
  // Bootstrap function for plugin setup (e.g., permissions)
  bootstrap(app) {
    // Example: Add permissions if your plugin has server-side actions
    // app.addPermissions([ ... ]);
  },

  // Register translations for the plugin
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          // Dynamically import translation files
          const { default: data } = await import(`./translations/${locale}.json`);
          // Prefix translations with plugin ID to avoid conflicts
          return { data: prefixPluginTranslations(data, PLUGIN_ID), locale };
        } catch {
          // If translation file doesn't exist, return empty data
          return { data: {}, locale };
        }
      })
    );
  }
};
