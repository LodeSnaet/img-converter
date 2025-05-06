import { DesignSystemProvider, lightTheme } from '@strapi/design-system';
import PluginSection from '../components/PluginSection';

const HomePage = () => {

  return (
    <DesignSystemProvider locale="en-GB" theme={lightTheme}>
        <PluginSection />
    </DesignSystemProvider>
  );
};

export default HomePage;
