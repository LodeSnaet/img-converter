import React from "react";
import {Box, LinkButton, Main, Typography} from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import {getTranslation} from "../utils/getTranslation";




function PluginSection() {
  const { formatMessage } = useIntl();

  const PaddedBox = styled(Box)`
    display: flex;
    flex-direction: column;
    padding-block-start: 40px;
    padding-block-end: 40px;
`;
  const MainBox = styled(Main)`
    padding-inline-start: 56px;
    padding-inline-end: 56px;
  `;
  const WhiteBox = styled(Box)`
    border-radius: 4px;
    background-color: #fff;
    padding-block-start: 24px;
    padding-block-end: 24px;
    padding-inline-start: 32px;
    padding-inline-end: 32px;
  `;
  const DescriptionTypography = styled(Typography)`
    margin-block-start: ${({ theme }) => theme.spaces.s1};
  `;

  const handleClick = async (e) => {
    e.preventDefault();

    const response = await strapi.fetch('/upload/files');
    const data = await response.json();
    console.log('Fetched files:', data);
  };

  return (
    <MainBox>
      <PaddedBox>
        <Typography variant="alpha">{formatMessage({ id: getTranslation('homepage.title'), defaultMessage: 'Img-Webp' })}</Typography>
        <DescriptionTypography variant="omega" textColor="neutral600">
          {formatMessage({
            id: getTranslation('homepage.description'),
            defaultMessage: 'Convert and optimize images to WebP format during media upload.' // Example description
          })}
        </DescriptionTypography>
      </PaddedBox>
      <WhiteBox>
        <LinkButton
          onClick={handleClick}
          size="M"
          variant="default"
        >
          Convert image files to WebP
        </LinkButton>
      </WhiteBox>
    </MainBox>
  );
}

export default PluginSection;
