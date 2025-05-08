import { DesignSystemProvider, lightTheme } from '@strapi/design-system';
import PluginSection from '../components/PluginSection';

const App = () => {
  return (
    <DesignSystemProvider locale="en-GB" theme={lightTheme}>
      <PluginSection />
    </DesignSystemProvider>  );
};

export default App;
