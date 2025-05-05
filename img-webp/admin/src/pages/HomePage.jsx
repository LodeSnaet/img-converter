import { Main } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';
import SettingsPage from "./Settings";

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <Main>
      <SettingsPage/>

    </Main>
  );
};

export { HomePage };
