import React, { /* Remove useEffect here */ useState } from 'react'; // Keep useState for component-level state
import { Box, LinkButton, Main, Typography } from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import { getTranslation } from "../utils/getTranslation";
import convertApi from '../api/convert'; // Assuming '../api/convert' exports an object with getConvert


function PluginSection() {
  const { formatMessage } = useIntl();

  // Define state at the top level of the functional component
  // This state will hold the array of fetched files.
  const [files, setFiles] = useState([]);

  // Styled components (keeping your original styled component definitions)
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

  // The handler function that runs when the LinkButton is clicked
  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const response = await convertApi.getConvert();
      // Zorg ervoor dat we de array uit de data property halen
      setFiles(response.data || []); // Fallback naar lege array als data undefined is
      console.log('Successfully fetched files:', response.data);
    } catch (error) {
      console.error('An error occurred during the API call:', error);
      setFiles([]); // Reset naar lege array bij error
    }
  };

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
      <WhiteBox>
        {/* The LinkButton component */}
        <LinkButton
          onClick={handleClick} // Attach the handleClick function here
          size="M"
          variant="default"
          // endIcon={<ArrowRight />} // Optional icon
        >
          Fetch Image Files {/* Button text */}
        </LinkButton>

        {/* Example of how to display the fetched file data */}
        {/* This will render only if the 'files' state array is not empty */}
        {files.length > 0 && (
          <Box padding={4} style={{ marginTop: '20px', borderTop: '1px solid #eee' }}>
            <Typography variant="beta">Fetched Image Files:</Typography>
            <ul>
              {/* Map over the 'files' state to render a list item for each file */}
              {files.map(file => (
                <li key={file.id}>
                  {/* Display file name and type, maybe a link to the URL */}
                  {file.fileName} ({file.type})
                  {file.url && (
                    <span> - <a href={file.url} target="_blank" rel="noopener noreferrer">View</a></span>
                  )}
                </li>
              ))}
            </ul>
          </Box>
        )}

      </WhiteBox>
    </MainBox>
  );
}

export default PluginSection;
