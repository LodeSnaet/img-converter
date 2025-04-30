import React, { useState } from 'react';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { request } from '@strapi/helper-plugin'; // Utility for making API calls
import { Box } from '@strapi/design-system/Box';
import { Typography } from '@strapi/design-system/Typography';
import { Stack } from '@strapi/design-system/Stack';
import { useNotification } from '@strapi/helper-plugin'; // For displaying notifications

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const toggleNotification = useNotification();

  const handleConvertClick = async () => {
    setLoading(true);
    try {
      // Make the API call to your server-side conversion endpoint
      const response = await request('/img-webp/convert-existing', { // Make sure this matches your server route path
        method: 'POST', // Or 'GET' depending on your route
      });

      // Display a success notification
      toggleNotification({
        type: 'success',
        message: response.message || 'Conversion process initiated successfully!',
      });

      console.log('Conversion Results:', response.results); // Log detailed results to console

    } catch (error) {
      // Display an error notification
      toggleNotification({
        type: 'warning', // Use warning for user-facing errors
        message: error.response?.data?.error?.message || 'An error occurred during conversion.',
      });
      console.error('Conversion Error:', error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <BaseHeaderLayout
        title="Image to WEBP Converter Settings"
        subtitle="Manage settings and tools for image conversion."
        as="h2"
      />

      {/* Page Content */}
      <ContentLayout>
        <Box padding={8} background="neutral0" shadow="filter03" hasRadius>
          <Stack spacing={4}>
            <Typography variant="alpha">Convert Existing Images</Typography>
            <Typography variant="omega">
              Click the button below to convert all existing uploaded images (excluding SVG and GIF) to WEBP format. This process might take some time depending on the number of images.
            </Typography>
            <Button onClick={handleConvertClick} loading={loading}>
              Convert All Images to WEBP
            </Button>
          </Stack>
        </Box>
      </ContentLayout>
    </>
  );
};

export default SettingsPage;
