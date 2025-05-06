import { PLUGIN_ID } from './pluginId'; // Assuming you have a pluginId.js file exporting your plugin's ID
import { Initializer } from './components/Initializer';
// PluginIcon is typically used for the main menu link icon,
// but you can optionally use it for the settings link icon too.

// Import your main App component that handles routing for your plugin's UI
// We will dynamically import this component later in the Component function
// import App from './pages/App';

const name = 'Image to WEBP'; // Display name for your plugin (used in intlLabel)

export default {
  register(app) {
    // Register the plugin itself with Strapi
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer, // Your plugin's initializer component
      isReady: false, // Set to true when the plugin is initialized
      name: PLUGIN_ID, // The internal ID of the plugin
    });

    // --- Create a new Setting Section for your plugin ---
    app.createSettingSection(
      // Section Object: Defines the new section in the sidebar
      {
        id: `${PLUGIN_ID}-settings-section`, // Unique ID for the new section
        intlLabel: {
          id: `${PLUGIN_ID}.settings.section.label`, // Translation key for the section title
          defaultMessage: `${name}`, // Default title for the section
        },
      },
      // Links Array: Defines the links that will appear within this new section
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.name`, // Translation key for the link title
            defaultMessage: name, // Default text for the link
          },
          id: PLUGIN_ID, // Unique ID for the link within the section
          // The URL path where this link navigates.
          // This should match the path where your App component is mounted.
          to: `/settings/${PLUGIN_ID}`,
          // Specify the component that should be rendered when this link is clicked.
          // We use the async import pattern to load your main App component.
          Component: async () => {
            return await import('./pages/App');
          }

          // Optional: Add permissions if this link requires specific access
          // permissions: [],
          // Optional: Add an icon next to the link within the section
          // icon: 'your-icon-name-string', // Example: icon: 'picture',
          // icon: PluginIcon, // Example: using your PluginIcon component
        },
        // You can add more link objects here if your plugin settings section
        // has multiple entry points or sub-pages directly linked from the sidebar.
        // {
        //   intlLabel: { id: `${PLUGIN_ID}.another.link`, defaultMessage: 'Another Link' },
        //   id: `${PLUGIN_ID}-another-link`,
        //   to: `/settings/${PLUGIN_ID}/another`, // Example path for another link
        //   Component: async () => {
        //      const component = await import('./pages/AnotherPage');
        //      return component;
        //   },
        // },
      ]
    );
    // --- End of Create Setting Section ---


    // --- Remove or comment out the old settings link and main menu link ---
    // We are now using createSettingSection instead of addSettingsLink
    /*
    app.addSettingsLink('global', {
      id: PLUGIN_ID,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: name,
      },
      to: `/settings/${PLUGIN_ID}`,
      Component: async () => {
         const component = await import('./pages/App');
         return component;
      },
    });
    */

    // As you want it only in settings, we remove the main menu link registration.
    /*
    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.menuLabel`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
    });
    */
    // --- End of Old Links ---


    // Register plugin's internal routes and components if needed
    // This is less common for settings pages where routing is handled
    // within the component returned by createSettingSection's links.
    // app.addInternalLink(...)


    // Register middlewares, reducers etc. if needed for your admin panel
    // app.addMiddleware(...)
    // app.addReducer(...)
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
