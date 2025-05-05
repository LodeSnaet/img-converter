const ImgWebp = async () => {
  const component = await import('./pages/App');
  return component;
};

export default {
  register(app) {
    app.createSettingSection(
      {
        id: 'img-webp-section',
        intlLabel: {
          id: 'img-webp.section.title',
          defaultMessage: 'Image WebP',
        },
      },
      [
        {
          id: 'img-webp-link',
          intlLabel: {
            id: 'img-webp.link.title',
            defaultMessage: 'WebP Settings',
          },
          to: '/settings/img-webp',
          Component: ImgWebp,
          permissions: [],
        },
      ]
    );
  },
  bootstrap(app) {
    // Optional: Add post-registration logic here if needed
  },
  async registerTrads({ locales }) {
    // Optional: Register translations for your plugin
    return {};
  },
};
