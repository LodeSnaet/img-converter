import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, LinkButton, Main, Typography, Table, Td, Thead, Tbody, Tr, Th,
  Checkbox, Pagination, NextLink, PageLink, PreviousLink, Alert, Tooltip, Toggle,
  Loader
} from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import { getTranslation } from "../utils/getTranslation";
import fetchImages from '../api/fetch-images';
import convertImages from '../api/convert-images'; // Import the refactored API module
import utilsImages from '../api/utils-images';
import autoConvertImages from '../api/auto-convert-images';
import selectedFiles from '../api/selected-files';

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
  color: #d02b20;
  font-size: 0.8rem;
`;

const NewTypeText = styled(Typography)`
  color: #5cb176;
  font-weight: bold;
  margin-left: 4px;
`;

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

const NotificationContainer = styled(Box)`
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 500px;
  max-width: 90vw;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    0% {
      transform: translate(-50%, -20px);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

const StyledPageLink = styled(PageLink)`
  ${({ active, theme }) =>
  active &&
  `
    border: 1px solid ${theme.colors.primary600}; // Use Strapi's primary blue color
    border-radius: 5px;
  `}
`;

function PluginSection() {
  const { formatMessage } = useIntl();
  const PAGE_SIZE = 7;

  // State
  const [files, setFiles] = useState([]); // State for the main list of files
  const [page, setPage] = useState(1);
  const [conversionResults, setConversionResults] = useState([]); // State for tracking conversion results per file
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: 'success', message: '' });
  const [autoConvert, setAutoConvert] = useState(false);
  const [checkedFiles, setCheckedFiles] = useState([]); // State for files selected in the current view
  const [isLoading, setIsLoading] = useState(false); // State to show loading indicator

  // Pagination calculations
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedFiles = files.slice(startIndex, endIndex);
  const pageCount = Math.ceil(files.length / PAGE_SIZE);
  const areAllSelected = paginatedFiles.length > 0 && paginatedFiles.every(file => checkedFiles.some(f => f.id === file.id));

  // Effect hooks
  useEffect(() => {
    // Load settings on mount
    const getSettings = async () => {
      try {
        const enabled = await autoConvertImages.getStatus();
        setAutoConvert(enabled);
      } catch (error) {
        console.error('Failed to fetch auto-convert settings:', error);
        showNotification('danger', 'Fout bij het laden van instellingen.');
      }
    };
    getSettings();
  }, []);

  // Event handlers
  const showNotification = useCallback((type, message) => {
    setAlertInfo({ type, message });
    setShowAlert(true);
    // Auto-hide the alert after 5 seconds
    const timer = setTimeout(() => setShowAlert(false), 5000);
    // Clear timeout if a new alert is shown before the previous one hides
    return () => clearTimeout(timer);
  }, []); // useCallback memoizes the function

  const handleFetchImages = async (e) => {
    e?.preventDefault(); // Prevent default if triggered by an event
    setIsLoading(true);
    try {
      const response = await fetchImages.fetchFiles(); // Fetch all files
      setFiles(response.data); // Update component state with files
      setPage(1); // Reset to first page
      setCheckedFiles([]); // Clear selected files when refetching the list
      await selectedFiles.setSelectedFiles([]); // Also clear selected files state on the backend
      setConversionResults([]); // Clear previous conversion results
      showNotification('success', 'Bestanden opgehaald.');
    } catch (error) {
      console.error('Error fetching files:', error);
      showNotification('danger', `Fout bij het ophalen van bestanden: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = useCallback((file) => {
    return async () => {
      const isSelected = checkedFiles.some(f => f.id === file.id);
      const newCheckedFiles = isSelected
        ? checkedFiles.filter(f => f.id !== file.id)
        : [...checkedFiles, file];

      setCheckedFiles(newCheckedFiles); // Update local state immediately for responsiveness

      try {
        // Update API with the *new* list of selected files
        await selectedFiles.setSelectedFiles(newCheckedFiles);
        // Notification is optional here, might be too noisy
        // showNotification('success', 'Selectie bijgewerkt.');
      } catch (error) {
        showNotification(
          'danger',
          `Fout bij het bijwerken van de selectie op de backend: ${error.message}`
        );
        // If API update fails, revert the local state to the previous state
        setCheckedFiles(checkedFiles);
      }
    };
  }, [checkedFiles, showNotification, selectedFiles]); // Include dependencies

  const handleSelectAll = async () => {
    // Determine the new list of checked files
    const newCheckedFiles = areAllSelected
      ? checkedFiles.filter(file => !paginatedFiles.some(pf => pf.id === file.id)) // Deselect page files
      : [...checkedFiles.filter(file => !paginatedFiles.some(pf => pf.id === file.id)), ...paginatedFiles]; // Add page files

    setCheckedFiles(newCheckedFiles); // Update local state immediately

    try {
      // Update API with the *entire* new list of selected files (across all pages)
      await selectedFiles.setSelectedFiles(newCheckedFiles);
      // Notification is optional here
      // showNotification('success', 'Selectie bijgewerkt.');
    } catch (error) {
      showNotification(
        'danger',
        `Fout bij het bijwerken van de selectie op de backend: ${error.message}`
      );
      // If API update fails, revert the local state
      setCheckedFiles(checkedFiles);
    }
  };

  const handleToggleChange = async () => {
    const newState = !autoConvert;
    setAutoConvert(newState); // Optimistic update

    try {
      await autoConvertImages.toggle(newState);
      showNotification(
        'success',
        `Automatisch converteren naar WebP is ${newState ? 'ingeschakeld' : 'uitgeschakeld'}.`
      );
    } catch (error) {
      // Revert state if API call fails
      setAutoConvert(!newState);
      showNotification(
        'danger',
        `Fout bij het bijwerken van instellingen: ${error.message}`
      );
    }
  };

  // New Handlers for Conversion Buttons
  const handleConvert = useCallback(async (converterFunction, conversionType) => {
    setIsLoading(true);
    setConversionResults([]); // Clear previous conversion results

    try {
      // The API function (converterFunction) now fetches selected files internally
      // and sends them for conversion.
      showNotification('info', `Starten met converteren naar ${conversionType}...`);
      const result = await converterFunction(); // Call the API function

      // Handle the response from the API
      if (result.skipped) {
        showNotification('warning', result.message || `Geen bestanden geselecteerd voor conversie naar ${conversionType}.`);
      } else {
        setConversionResults(result.results); // Update state with results for the table
        setCheckedFiles([]); // Clear local selection after conversion
        await selectedFiles.setSelectedFiles([]); // Clear backend selection after conversion

        if (result.totalConverted > 0) {
          showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar ${conversionType}.`);
          // Refetch ALL files after successful conversion to update the table previews and types
          // Use a small delay to allow backend processing to finish completely if needed
          setTimeout(handleFetchImages, 1000); // Delay refetch slightly
        } else if (result.results && result.results.length > 0) {
          // If totalConverted is 0 but there are results, it means all failed
          showNotification('warning', `Geen bestanden konden worden geconverteerd naar ${conversionType}.`);
        } else {
          // Unexpected scenario
          showNotification('warning', `Conversie naar ${conversionType} voltoooid, maar met onverwacht resultaat.`);
        }
      }

    } catch (error) {
      console.error(`Error during ${conversionType} conversion:`, error);
      // Use the error message from the API or a generic one
      showNotification('danger', `Conversie naar ${conversionType} mislukt: ${error.message || 'Onbekende fout.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [showNotification, selectedFiles, handleFetchImages]); // Include dependencies

  // Memoized conversion handlers using the generic handler
  const handleConvertWebP = useCallback(() => handleConvert(convertImages.img2webp, 'WebP'), [handleConvert]);
  const handleConvertPNG = useCallback(() => handleConvert(convertImages.img2png, 'PNG'), [handleConvert]);
  const handleConvertJPG = useCallback(() => handleConvert(convertImages.img2jpg, 'JPG'), [handleConvert]);


  const isFileSelected = (file) => checkedFiles.some(f => f.id === file.id);
  const isFileConverted = (fileId) => conversionResults.some(r => r.id === fileId && r.success);
  const getConversionResult = (fileId) => conversionResults.find(r => r.id === fileId);

  return (
    <MainBox>
      {/* Notification component */}
      {showAlert && (
        <NotificationContainer>
          <Alert
            closeLabel="Sluiten"
            title={
              alertInfo.type === 'success' ? 'Gelukt!' :
                alertInfo.type === 'warning' ? 'Let op!' :
                  alertInfo.type === 'info' ? 'Informatie' : 'Fout'
            }
            variant={alertInfo.type}
            onClose={() => setShowAlert(false)}
          >
            {alertInfo.message}
          </Alert>
        </NotificationContainer>
      )}

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
            defaultMessage: 'Convert and optimize images to WebP format during media upload.',
          })}
        </DescriptionTypography>
      </PaddedBox>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'start' }}>
        <Box style={{display:'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '16px'}}>
          <ContentBox>
            <PaddedBox style={{ paddingBlock: '0px' }}>
              <Typography variant="beta">
                {formatMessage({
                  id: getTranslation('buttonpage.description'),
                  defaultMessage: 'Convert and optimize images to WebP format during media upload.',
                })}
              </Typography>
              {/* Hint text conditional on files fetched and no files selected */}
              {files.length > 0 && checkedFiles.length === 0 && (
                // This text will only show if files are loaded but none are checked
                <Typography variant="epsilon" textColor="neutral600" style={{ marginBottom: '8px' }}>
                  Please select an image before you can start an action
                </Typography>
              )}
            </PaddedBox>
            {/* Loading indicator for fetching files */}
            <FlexBox style={{alignItems: 'center', gap: '8px'}}>
              <LinkButton onClick={handleFetchImages} size="M" variant="default" disabled={isLoading}>
                Fetch Image Files
              </LinkButton>
              {isLoading && <Loader small />}
            </FlexBox>
          </ContentBox>

          <ContentBox>
            <PaddedBox style={{ paddingBlock: '0px' }}>
              <Typography variant="beta">
                {formatMessage({
                  id: getTranslation('autoconvert.description'),
                  defaultMessage: 'Turn on auto convert to WebP?',
                })}
              </Typography>
            </PaddedBox>
            {/* Toggle for auto-convert */}
            <Toggle
              label="Auto convert to WebP"
              hint="When checked images get converted to WebP's automatically when uploaded."
              name="autoConvertToggle"
              onLabel="Yes"
              offLabel="No"
              checked={autoConvert}
              onChange={handleToggleChange}
              disabled={isLoading} // Disable toggle while loading
            />
          </ContentBox>
        </Box>

        {/* Conversion Actions Section - Show only if files are loaded AND at least one file is selected */}
        {files.length > 0 && checkedFiles.length > 0 && (
          <ContentBox>
            <PaddedBox style={{ paddingBlock: '0px' }}>
              <Typography variant="beta">
                {formatMessage({
                  id: getTranslation('convertpage.description'),
                  defaultMessage: 'Select action you want to complete',
                })}
              </Typography>
              <Typography variant="epsilon" textColor="neutral600" style={{ marginBottom: '8px' }}>
                {checkedFiles.length} {checkedFiles.length === 1 ? 'bestand' : 'bestanden'} geselecteerd
              </Typography>
            </PaddedBox>

            {/* Check if *any* selected files are convertible by any method */}
            <Box>
              {!utilsImages.hasConvertibleFilesForWEBP(checkedFiles, files) &&
                !utilsImages.hasConvertibleFilesForPNG(checkedFiles, files) &&
                !utilsImages.hasConvertibleFilesForJPG(checkedFiles, files) && (
                  <Typography variant="pi" textColor="danger600">
                    Geen van de geselecteerde bestanden kan worden geconverteerd naar de geselecteerde typen.
                  </Typography>
                )}
            </Box>

            <FlexBox style={{alignItems: 'center', gap: '16px'}}>
              {/* WebP Convert Button */}
              {utilsImages.hasConvertibleFilesForWEBP(checkedFiles, files) ? (
                <LinkButton onClick={handleConvertWebP} size="M" variant="default" disabled={isLoading}>
                  IMG - WEBP
                </LinkButton>
              ) : ( // Button disabled if no convertible files for this type among selected ones
                // Show disabled button only if *some* files are selected, otherwise the whole section is hidden
                checkedFiles.length > 0 && (
                  <Tooltip description="Geen bestanden geselecteerd die naar WebP kunnen worden geconverteerd">
                    <Box>
                      <LinkButton disabled size="M" variant="secondary">
                        IMG - WEBP
                      </LinkButton>
                    </Box>
                  </Tooltip>
                )
              )}

              {/* PNG Convert Button */}
              {utilsImages.hasConvertibleFilesForPNG(checkedFiles, files) ? (
                <LinkButton onClick={handleConvertPNG} size="M" variant="default" disabled={isLoading}>
                  IMG - PNG
                </LinkButton>
              ) : (
                checkedFiles.length > 0 && (
                  <Tooltip description="Geen bestanden geselecteerd die naar PNG kunnen worden geconverteerd">
                    <Box>
                      <LinkButton disabled size="M" variant="secondary">
                        IMG - PNG
                      </LinkButton>
                    </Box>
                  </Tooltip>
                )
              )}

              {/* JPG Convert Button */}
              {utilsImages.hasConvertibleFilesForJPG(checkedFiles, files) ? (
                <LinkButton onClick={handleConvertJPG} size="M" variant="default" disabled={isLoading}>
                  IMG - JPG
                </LinkButton>
              ) : (
                checkedFiles.length > 0 && (
                  <Tooltip description="Geen bestanden geselecteerd die naar JPG kunnen worden geconverteerd">
                    <Box>
                      <LinkButton disabled size="M" variant="secondary">
                        IMG - JPG
                      </LinkButton>
                    </Box>
                  </Tooltip>
                )
              )}
              {isLoading && <Loader small />} {/* Show loader next to buttons during conversion */}
            </FlexBox>
          </ContentBox>
        )}

        {/* Files Table Section - Show only if files are loaded */}
        {files.length > 0 && (
          <ContentBox>
            <Table colCount={5} rowCount={paginatedFiles.length}> {/* Use actual colCount and rowCount */}
              <Thead>
                <Tr>
                  <Th> {/* Checkbox column */}
                    <Checkbox
                      aria-label="Select all entries on current page"
                      checked={areAllSelected}
                      indeterminate={checkedFiles.length > 0 && !areAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </Th>
                  <Th><Typography variant="sigma">PREVIEW</Typography></Th>
                  <Th><Typography variant="sigma">ID</Typography></Th>
                  <Th><Typography variant="sigma">NAME</Typography></Th> {/* Changed URL to NAME as per column content */}
                  <Th><Typography variant="sigma">TYPE</Typography></Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedFiles.map((file) => {
                  const conversionResult = getConversionResult(file.id);
                  const isConverted = isFileConverted(file.id);

                  console.log(`Result for file ${file.id}:`, file);
                  return (
                    <Tr key={file.id}>
                      <Td>
                        <Checkbox
                          aria-label={`Select file ${file.name || file.id}`}
                          checked={isFileSelected(file)}
                          onCheckedChange={handleCheckboxChange(file)}
                        />
                      </Td>
                      <Td>
                        <Box padding={1} style={{ width: '50px', height: '50px' }}>
                          {file.url ? (
                            // Add a timestamp to the URL to bust browser cache and show the new version after conversion
                            <img
                              src={`${file.url}?t=${Date.now()}`}
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
                        {isConverted ? (
                          <Box>
                            <StrikethroughText>{conversionResult.type}</StrikethroughText>
                            <NewTypeText>{conversionResult.newType}</NewTypeText>
                          </Box>
                        ) : (
                          <Typography textColor="neutral800">{file.type || 'N/A'}</Typography>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            {/* Pagination */}
            {pageCount > 1 && (
              <Nav pageCount={pageCount} currentPage={page} onPageChange={setPage}>
                <PreviousLink onClick={() => setPage(prev => Math.max(1, prev - 1))}>
                  {formatMessage({ id: getTranslation('pagination.previous'), defaultMessage: 'Previous' })}
                </PreviousLink>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNumber => (
                  <StyledPageLink
                    key={pageNumber}
                    number={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    active={pageNumber === page}
                    aria-current={pageNumber === page ? 'page' : undefined}
                  >
                    {pageNumber}
                  </StyledPageLink>
                ))}


            <NextLink onClick={() => setPage(prev => Math.min(pageCount, prev + 1))}>
                  {formatMessage({ id: getTranslation('pagination.next'), defaultMessage: 'Next' })}
                </NextLink>
              </Nav>
            )}
          </ContentBox>
        )}

        {/* Message when no files are loaded */}
        {!isLoading && files.length === 0 && (
          <ContentBox>
            <Typography variant="beta" textColor="neutral600">
              {formatMessage({ id: getTranslation('homepage.nofiles'), defaultMessage: 'No files loaded yet. Click "Fetch Image Files" to begin.' })}
            </Typography>
          </ContentBox>
        )}


      </Box>
    </MainBox>
  );
}

export default PluginSection;
