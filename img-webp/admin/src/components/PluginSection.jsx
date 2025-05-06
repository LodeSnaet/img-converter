import React from "react";
import { Box, Main, Typography } from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import {getTranslation} from "../utils/getTranslation";




function PluginSection() {
  const { formatMessage } = useIntl();

  console.log(formatMessage({ id: getTranslation('plugin.name'), defaultMessage: 'Img to Webp' }));

  const PaddedBox = styled(Box)`
    padding-block-start: 40px;
    padding-block-end: 40px;
    padding-inline-start: 56px;
    padding-inline-end: 56px;
`;

  return (
    <Main>
      <PaddedBox>
        <Typography variant="alpha">{formatMessage({ id: getTranslation('plugin.name'), defaultMessage: 'Img to Webp' })}</Typography>
        {/* Add your plugin's content here */}
      </PaddedBox>
    </Main>
  );
}

export default PluginSection;
