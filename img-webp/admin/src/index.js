import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

const imgWebp = async () => {
  const { App } = await import('./pages/App');

  return App;
};

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: imgWebp,
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }) {
    // return Promise.all(
    //   locales.map(async (locale) => {
    //     try {
    //       const { default: data } = await import(`./translations/${locale}.json`); // <--- This is where the magic happens
    //       return { data, locale };
    //     } catch {
    //       return { data: {}, locale }; // <--- If import fails, it returns empty data!
    //     }
    //   })
    // );
  }
};
