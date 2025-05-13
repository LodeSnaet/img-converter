import React, { useEffect, useState, useCallback } from 'react';
import { Box, LinkButton, Main, Typography, Table, Td, Thead, Tbody, Tr, Th, Checkbox, Pagination, NextLink, PageLink, PreviousLink, Alert, Tooltip, Toggle } from "@strapi/design-system";
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import { getTranslation } from "../utils/getTranslation";
import fetchImages from '../api/fetch-images';

// Styled component voor doorgestreepte tekst
const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
  color: #d02b20; /* Rode kleur */
  font-size: 0.8rem;
`;

// Styled component voor succesvolle conversies
const NewTypeText = styled(Typography)`
  color: #5cb176; /* Groene kleur */
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

// In PluginSection.jsx, voeg deze imports toe
// Voeg deze functies toe
const toggleAutoConvert = async (enabled) => {
  try {
    const response = await fetch('/img-webp/set-auto-convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Auto-convert settings updated:', result);

    return result;
  } catch (error) {
    console.error("Error updating auto-convert settings:", error);
    throw error;
  }
};

const fetchAutoConvertSettings = async () => {
  try {
    const response = await fetch('/img-webp/get-auto-convert');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.enabled;
  } catch (error) {
    console.error("Error fetching auto-convert settings:", error);
    return false; // Standaardwaarde is uitgeschakeld bij een fout
  }
};



function PluginSection() {
  const { formatMessage } = useIntl();

  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [conversionResults, setConversionResults] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: 'success', message: '' });
  const [autoConvert, setAutoConvert] = useState(false);
  const pageSize = 7;


  const hasConvertibleFilesForWebP = () => {
    if (selectedFiles.length === 0) return false;

    return selectedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar WebP kan worden geconverteerd
      return (
        (fullFile.mime.startsWith('image/') &&
          fullFile.mime !== 'image/webp' &&
          fullFile.mime !== 'image/svg+xml')
      );
    });
  };

  const hasConvertibleFilesForPNG = () => {
    if (selectedFiles.length === 0) return false;

    return selectedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar PNG kan worden geconverteerd
      return (
        (fullFile.mime.startsWith('image/') &&
          fullFile.mime !== 'image/png' &&
          fullFile.mime !== 'image/svg+xml')
      );
    });
  };

  const hasConvertibleFilesForJPG = () => {
    if (selectedFiles.length === 0) return false;

    return selectedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar JPG kan worden geconverteerd
      // JPG ondersteunt geen transparantie, dus SVG en PNG met transparantie zijn niet ideaal,
      // maar we tonen de knop toch omdat het technisch mogelijk is
      return (
        (fullFile.mime.startsWith('image/') &&
          fullFile.mime !== 'image/jpeg' &&
          fullFile.mime !== 'image/jpg')
      );
    });
  };

  useEffect(() => {
    const getSettings = async () => {
      const enabled = await fetchAutoConvertSettings();
      setAutoConvert(enabled);
    };

    getSettings();
  }, []);


  const handleClick = async (e) => {
    e.preventDefault();
    const response = await fetchImages.fetchFiles();
    setFiles(response.data);
    // Wis alle conversieresultaten bij een nieuwe fetch
    setConversionResults([]);
    console.log('Fetched files:', response.data);
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

  // Controleer of een bestand succesvol is geconverteerd
  const isFileConverted = (fileId) => {
    return conversionResults.some(r => r.id === fileId && r.success);
  };

  // Haal het conversieresultaat op voor een bestand
  const getConversionResult = (fileId) => {
    return conversionResults.find(r => r.id === fileId);
  };

  // Functie om een notificatie te tonen
  const showNotification = (type, message) => {
    setAlertInfo({ type, message });
    setShowAlert(true);

    // Verberg notificatie na 5 seconden
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const img2webp = async () => {
    if (selectedFiles.length === 0) {
      showNotification('warning', 'Geen bestanden geselecteerd voor conversie.');
      return;
    }

    try {
      // Define the URL of your backend plugin endpoint
      const backendEndpoint = '/img-webp/convert-to-webp';

      // Make the POST request
      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: selectedFiles }),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend conversion API returned an error:", response.status, errorData);
        showNotification('danger', `Fout bij conversie: ${errorData.message || response.statusText}`);
        return;
      }

      // If the request was successful (status 2xx)
      const result = await response.json();

      // Sla de resultaten op in de state
      setConversionResults(result.results);

      // Reset geselecteerde bestanden na conversie
      setSelectedFiles([]);

      // Toon melding over resultaat
      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar WebP.`);

        // Haal de bestanden opnieuw op om de updates te zien
        setTimeout(async () => {
          const response = await fetchImages.fetchFiles();
          setFiles(response.data);
        }, 2000); // Langer wachten (2 seconden)
      } else {
        showNotification('warning', 'Geen bestanden konden worden geconverteerd.');
      }
    } catch (error) {
      console.error("Error calling backend conversion API:", error);
      showNotification('danger', `Netwerkfout bij conversie: ${error.message}`);
    }
  };

  const img2png = async () => {
    if (selectedFiles.length === 0) {
      showNotification('warning', 'Geen bestanden geselecteerd voor conversie.');
      return;
    }


    // Controleer welke bestandstypen je hebt geselecteerd
    selectedFiles.forEach(file => {
      const fullFileInfo = files.find(f => f.id === file.id);
    });

    try {
      // Dit kan anders zijn dan wat je denkt - controleer de exacte URL
      const backendEndpoint = '/img-webp/convert-to-png';

      const requestBody = JSON.stringify({ files: selectedFiles });

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });


      // Probeer eerst de ruwe response te bekijken
      const responseText = await response.text();

      let result;
      try {
        // Probeer het als JSON te parsen
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        showNotification('danger', `Fout bij het verwerken van de response: ${e.message}`);
        return;
      }

      // Onderzoek waarom de conversies mislukten
      if (result.results && result.results.length > 0) {
        const failedResults = result.results.filter(r => !r.success);

        // Groepeer de redenen
        const reasons = {};
        failedResults.forEach(item => {
          reasons[item.message] = (reasons[item.message] || 0) + 1;
        });
      }

      // De rest van je functie...
      setConversionResults(result.results);
      setSelectedFiles([]);

      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar PNG.`);

        setTimeout(async () => {
          const response = await fetchImages.fetchFiles();
          setFiles(response.data);
        }, 2000); // Langer wachten (2 seconden)
      } else {
        showNotification('warning', 'Geen bestanden konden worden geconverteerd naar PNG.');
      }
    } catch (error) {
      console.error("Error tijdens PNG conversie:", error);
      showNotification('danger', `Netwerkfout bij conversie: ${error.message}`);
    }
  };

  const img2jpg = async () => {
    if (selectedFiles.length === 0) {
      showNotification('warning', 'Geen bestanden geselecteerd voor conversie.');
      return;
    }

    selectedFiles.forEach(file => {
      const fullFileInfo = files.find(f => f.id === file.id);
    });

    try {
      const backendEndpoint = '/img-webp/convert-to-jpg';

      const requestBody = JSON.stringify({ files: selectedFiles });

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        showNotification('danger', `Fout bij het verwerken van de response: ${e.message}`);
        return;
      }


      if (result.results && result.results.length > 0) {
        const failedResults = result.results.filter(r => !r.success);

        const reasons = {};
        failedResults.forEach(item => {
          reasons[item.message] = (reasons[item.message] || 0) + 1;
        });
      }

      setConversionResults(result.results);
      setSelectedFiles([]);

      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar JPG.`);

        setTimeout(async () => {
          const response = await fetchImages.fetchFiles();
          setFiles(response.data);
        }, 2000); // Langer wachten (2 seconden)
      } else {
        showNotification('warning', 'Geen bestanden konden worden geconverteerd naar JPG.');
      }
    } catch (error) {
      console.error("Error tijdens JPG conversie:", error);
      showNotification('danger', `Netwerkfout bij conversie: ${error.message}`);
    }
  };

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

  // Functie voor "Selecteer alles" checkbox
  const handleSelectAll = () => {
    if (selectedFiles.length === paginatedFiles.length) {
      // Als alle items op de huidige pagina zijn geselecteerd, deselecteer alles
      setSelectedFiles([]);
    } else {
      // Anders selecteer alle items op de huidige pagina
      setSelectedFiles(paginatedFiles);
    }
  };

  // Controleer of alle items op de huidige pagina zijn geselecteerd
  const areAllSelected = paginatedFiles.length > 0 &&
    paginatedFiles.every(file => selectedFiles.some(f => f.id === file.id));

// Update je handleToggleChange functie
const handleToggleChange = async () => {
  const newState = !autoConvert;
  setAutoConvert(newState);

  try {
    await toggleAutoConvert(newState);
    console.log('Toggle is nu:', newState);

    showNotification(
      'success',
      `Automatisch converteren naar WebP is ${newState ? 'ingeschakeld' : 'uitgeschakeld'}.`
    );
  } catch (error) {
    // Als er een fout optreedt, herstel dan de UI-status
    setAutoConvert(!newState);
    showNotification(
      'danger',
      `Fout bij het bijwerken van instellingen: ${error.message}`
    );
  }
};

// Voeg deze useEffect toe
useEffect(() => {
  const getSettings = async () => {
    const enabled = await fetchAutoConvertSettings();
    setAutoConvert(enabled);
  };

  getSettings();
}, []);


  return (
    <MainBox>
      {showAlert && (
        <NotificationContainer>
          <Alert
            closeLabel="Sluiten"
            title={alertInfo.type === 'success' ? 'Gelukt!' :
                  alertInfo.type === 'warning' ? 'Let op!' :
                  alertInfo.type === 'info' ? 'Informatie' : 'Fout'}
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
              {files.length > 0 && selectedFiles.length === 0 && (
                <Typography variant="epsilon" textColor="neutral600" style={{ marginBottom: '8px' }}>
                  Please select an image before you can start an action
                </Typography>
              )}
            </PaddedBox>
            <LinkButton onClick={handleClick} size="M" variant="default">
              Fetch Image Files
            </LinkButton>
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
            <Toggle
              label="Auto convert to WebP"
              hint="When checked images get converted to WebP's automatically when uploaded."
              name="autoConvertToggle"
              onLabel="Yes"
              offLabel="No"
              checked={autoConvert}
              onChange={handleToggleChange}
            />
          </ContentBox>
        </Box>

        {files.length > 0 && selectedFiles.length > 0 && (
          <ContentBox>
            <PaddedBox style={{ paddingBlock: '0px' }}>
              <Typography variant="beta">
              {formatMessage({
                id: getTranslation('convertpage.description'),
                defaultMessage: 'Select action you want to complete',
              })}
            </Typography>
              <Typography variant="epsilon" textColor="neutral600" style={{ marginBottom: '8px' }}>
                {selectedFiles.length} {selectedFiles.length === 1 ? 'bestand' : 'bestanden'} geselecteerd
              </Typography>
            </PaddedBox>

            <Box>
              {!hasConvertibleFilesForWebP() && !hasConvertibleFilesForPNG() && !hasConvertibleFilesForJPG() && (
                <Typography variant="pi" textColor="danger600">
                  Geen van de geselecteerde bestanden kan worden geconverteerd. Selecteer afbeeldingsbestanden.
                </Typography>
              )}
            </Box>

            <FlexBox>
              {hasConvertibleFilesForWebP() ? (
                <LinkButton onClick={img2webp} size="M" variant="default">
                  IMG - WEBP
                </LinkButton>
              ) : selectedFiles.length > 0 && (
                <Tooltip description="Geen bestanden geselecteerd die naar WebP kunnen worden geconverteerd">
                  <Box>
                    <LinkButton disabled size="M" variant="secondary">
                      IMG - WEBP
                    </LinkButton>
                  </Box>
                </Tooltip>
              )}

              {hasConvertibleFilesForPNG() ? (
                <LinkButton onClick={img2png} size="M" variant="default">
                  IMG - PNG
                </LinkButton>
              ) : selectedFiles.length > 0 && (
                <Tooltip description="Geen bestanden geselecteerd die naar PNG kunnen worden geconverteerd">
                  <Box>
                    <LinkButton disabled size="M" variant="secondary">
                      IMG - PNG
                    </LinkButton>
                  </Box>
                </Tooltip>
              )}

              {hasConvertibleFilesForJPG() ? (
                <LinkButton onClick={img2jpg} size="M" variant="default">
                  IMG - JPG
                </LinkButton>
              ) : selectedFiles.length > 0 && (
                <Tooltip description="Geen bestanden geselecteerd die naar JPG kunnen worden geconverteerd">
                  <Box>
                    <LinkButton disabled size="M" variant="secondary">
                      IMG - JPG
                    </LinkButton>
                  </Box>
                </Tooltip>
              )}
            </FlexBox>
          </ContentBox>
        )}
        {files.length > 0 && (
          <ContentBox>
            <Table colCount={files.length + 1}>
              <Thead>
                <Tr>
                  <Th style={{ pointerEvents: 'auto' }}>
                    <Checkbox
                      aria-label="Select all entries"
                      checked={areAllSelected}
                      indeterminate={selectedFiles.length > 0 && !areAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </Th>
                  <Th>
                    <Typography variant="sigma">PREVIEW</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">ID</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">URL</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">TYPE</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedFiles.map((file) => {
                  const conversionResult = getConversionResult(file.id);
                  const isConverted = isFileConverted(file.id);

                  return (
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
                              src={`${file.url}?t=${Date.now()}`} // Voorkom caching door timestamp toe te voegen
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
                            <StrikethroughText>{conversionResult.name.split('.').pop().toUpperCase()}</StrikethroughText>
                            <NewTypeText>{file.type}</NewTypeText>
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
