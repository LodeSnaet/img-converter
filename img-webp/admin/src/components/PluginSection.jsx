import React, { useState, useCallback } from 'react';
import { Box, LinkButton, Main, Typography, Table, Td, Thead, Tbody, Tr, Th, Checkbox, Pagination, Dots, NextLink, PageLink, PreviousLink } from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import { getTranslation } from "../utils/getTranslation";
import fetchImages from '../api/fetch-images';

function PluginSection() {
  const { formatMessage } = useIntl();

  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const headers = files.length > 0 ? Object.keys(files[0]) : [];

  const PaddedBox = styled(Box)`
    display: flex;
    flex-direction: column;
    padding-block-start: 40px;
    padding-block-end: 40px;
  `;

  const Nav = styled(Pagination)`
    display: flex;
    justify-content: center;
    width: 100%;
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

  const FlexBox = styled(Box)`
    display: flex;
    flex-direction: row;
    gap: 16px;
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
    console.log('Fetched files:', response.data); // Controleer de data
  }

  const handleCheckboxChange = useCallback(
    (file) => {
      return () => {
        setSelectedFiles(prev => {
          const isSelected = prev.some(f => f.id === file.id);
          if (isSelected) {
            return prev.filter(f => f.id !== file.id);
          } else {
            return [...prev, file];
          }
        });
      };
    },
    [setSelectedFiles]
  );

  const isFileSelected = (file) => {
    return selectedFiles.some(f => f.id === file.id);
  };

  const img2webp = () => {
    console.log("Files converted to webp")
  }

  const img2png = () => {
    console.log("Files converted to png")
  }

  const img2jpg = () => {
    console.log("Files converted to jpg")
  }

    // Calculate the start and end index for the current page
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get the files for the current page
    const paginatedFiles = files.slice(startIndex, endIndex);

    let pageCount = Math.ceil(files.length / pageSize);

    // Check if the last page is empty
    if (files.length > 0 && files.length % pageSize === 0) {
        pageCount = files.length / pageSize;
    }

  console.log('Files:', selectedFiles);
  console.log('files.length:', files.length);
  console.log('pageCount:', pageCount);
  return (
    <MainBox>
      <PaddedBox>
        <Typography variant="alpha">
          {formatMessage({
            id: getTranslation('homepage.title'),
            defaultMessage: 'Img-Webp Plugin',
          })}
        </Typography>
        <DescriptionTypography variant="omega" textColor="neutral600">
          {formatMessage({
            id: getTranslation('homepage.description'),
            defaultMessage: 'Convert and optimize images to WebP format during media upload.', // Example description
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
          <LinkButton onClick={handleClick} size="M" variant="default">
            Fetch Image Files
          </LinkButton>
        </ContentBox>

        {files.length > 0 && (
          <ContentBox>
            <Typography variant="beta">
              {formatMessage({
                id: getTranslation('convertpage.description'),
                defaultMessage: 'Select action you want to complete',
              })}
            </Typography>
            <FlexBox>
              <LinkButton onClick={img2webp} size="M" variant="default">
                IMG - WEBP
              </LinkButton>
              <LinkButton onClick={img2png} size="M" variant="default">
                IMG - PNG
              </LinkButton>
              <LinkButton onClick={img2jpg} size="M" variant="default">
                IMG - JPG
              </LinkButton>
            </FlexBox>
          </ContentBox>
        )}
        {files.length > 0 && (
          <ContentBox>
            <Table colCount={headers.length + 1}>
              <Thead>
                <Tr>
                  <Th style={{ pointerEvents: 'auto' }}>
                    <Checkbox
                      aria-label="Select all entries"
                    />
                  </Th>
                  {headers.map((header, index) => (
                    <Th key={index}>
                      <Typography variant="sigma">{header}</Typography>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedFiles.map((file) => (
                  <Tr key={file.id}>
                    <Td style={{ pointerEvents: 'auto' }}>
                      <Checkbox
                        aria-label={`Select file ${file.name}`}
                        checked={isFileSelected(file)}
                        onCheckedChange={handleCheckboxChange(file)}
                      />
                    </Td>
                    <Td>
                      <Box padding={1} style={{ width: '50px', height: '50px' }}>
                        {file.url ? (
                          <img
                            src={file.url}
                            alt={`Preview of ${file.name || file.id}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="omega">No preview</Typography>
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{file.id}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{file.name || 'N/A'}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{file.type || 'N/A'}</Typography>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {pageCount > 1 && (
              <Nav
                pageCount={pageCount}
                currentPage={page}
                onPageChange={setPage}
              >
                <PreviousLink onClick={() => setPage(prev => prev - 1)}>Vorige</PreviousLink>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNumber => (
                  <PageLink
                    key={pageNumber}
                    number={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === page ? 'page' : undefined}
                  >
                    {pageNumber}
                  </PageLink>
                ))}
                <NextLink onClick={() => setPage(prev => prev + 1)}>Volgende</NextLink>
              </Nav>
            )}
          </ContentBox>
        )}
      </Box>
    </MainBox>
  );
}

export default PluginSection;
