import React, { useEffect, useState } from 'react';
import { Box, LinkButton, Main, Typography } from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import { getTranslation } from "../utils/getTranslation";
import fetchImages from '../api/fetch-images';

function PluginSection() {
  const { formatMessage } = useIntl();

  const [files, setFiles] = useState([]);

  const PaddedBox = styled(Box)`
    display: flex;
    flex-direction: column;
    padding-block-start: 40px;
    padding-block-end: 40px;
  `;

  const ContentBox = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 16px;
    border-radius: 4px;
    background-color: #fff;
    padding-block: 24px;
    padding-inline: 32px;
  `;

  const MainBox = styled(Main)`
    padding-inline-start: 56px;
    padding-inline-end: 56px;
  `;
  const DescriptionTypography = styled(Typography)`
    margin-block-start: ${({ theme }) => theme.spaces.s1};
  `;


  const handleClick = async (e) => {
    e.preventDefault();
    const response = await fetchImages.fetchFiles();
    setFiles(response.data);
    console.log('Fetched files:', response.data);
  }

  return (
    <MainBox>
      <PaddedBox>
        <Typography variant="alpha">{formatMessage({ id: getTranslation('homepage.title'), defaultMessage: 'Img-Webp Plugin' })}</Typography>
        <DescriptionTypography variant="omega" textColor="neutral600">
          {formatMessage({
            id: getTranslation('homepage.description'),
            defaultMessage: 'Convert and optimize images to WebP format during media upload.' // Example description
          })}
        </DescriptionTypography>
      </PaddedBox>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'start' }}>
        <ContentBox>
          <Typography variant="beta">
            {formatMessage({
              id: getTranslation('buttonpage.description'),
              defaultMessage: 'Convert and optimize images to WebP format during media upload.',
            })}
          </Typography>
          <LinkButton
            onClick={handleClick}
            size="M"
            variant="default"
          >
             Fetch Image Files
          </LinkButton>

      </ContentBox>

        <ContentBox>
          <Typography variant="beta">Fetched Image Files:</Typography>
          {files.map(file => (
            <Typography variant="default" key={file.id}>{file.name}</Typography>
          ))}
        </ContentBox>
      </Box>
    </MainBox>
  );
}

export default PluginSection;
