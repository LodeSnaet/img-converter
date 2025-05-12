import React, { useState, useCallback } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
const { get } = useFetchClient();

import { Box, LinkButton, Main, Typography, Table, Td, Thead, Tbody, Tr, Th, Checkbox, Pagination, NextLink, PageLink, PreviousLink, Alert } from "@strapi/design-system";
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

const PluginSection = () => {
  const { formatMessage } = useIntl();

  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [conversionResults, setConversionResults] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: 'success', message: '' });
  const pageSize = 7;

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


  const fetchFiles = async () => {
    try {
      const timestamp = Date.now();

      const response = await get(`/upload/files?_=${timestamp}`);
      const data = await response.json();

      const images = data
        .map(file => ({
          id: file.id,
          name: file.name || file.fileName,
          url: file.url,
          mime: file.mime,
          type: convertApi.determineFileType(file.mime),
        }))
        .filter(file => file.type !== null);

      return { data: images };
    } catch (err) {
      console.log(500, 'Fout bij ophalen bestanden');
    }
  }

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

    console.log("Attempting to send selected files for conversion:", selectedFiles);

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
      console.log("Conversion results from backend:", result);

      // Sla de resultaten op in de state
      setConversionResults(result.results);

      // Reset geselecteerde bestanden na conversie
      setSelectedFiles([]);

      // Toon melding over resultaat
      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar WebP.`);

        // Haal de bestanden opnieuw op om de updates te zien
        setTimeout(async () => {
          console.log("Bestanden opnieuw ophalen na conversie...");
          const response = await fetchFiles;
          console.log("Nieuwe bestandsgegevens:", response.data.map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            mime: file.mime // Check of 'mime' beschikbaar is hier
          })));
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

    // Uitgebreide logging van geselecteerde bestanden
    console.log("Geselecteerde bestanden voor PNG conversie:", selectedFiles);

    // Controleer welke bestandstypen je hebt geselecteerd
    selectedFiles.forEach(file => {
      const fullFileInfo = files.find(f => f.id === file.id);
      console.log(`Bestand: ${file.name}, Type: ${fullFileInfo?.type || 'onbekend'}`);
    });

    try {
      // Dit kan anders zijn dan wat je denkt - controleer de exacte URL
      const backendEndpoint = '/img-webp/convert-to-png';
      console.log("API endpoint:", backendEndpoint);

      const requestBody = JSON.stringify({ files: selectedFiles });
      console.log("Request body:", requestBody);

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log("Response status:", response.status);

      // Probeer eerst de ruwe response te bekijken
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        // Probeer het als JSON te parsen
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        showNotification('danger', `Fout bij het verwerken van de response: ${e.message}`);
        return;
      }

      console.log("Volledige resultaten:", result);
      console.log("Individuele resultaten:", result.results);
      console.log("Succesvolle conversies:", result.totalConverted);
      console.log("Mislukte conversies:", result.totalFailed);

      // Onderzoek waarom de conversies mislukten
      if (result.results && result.results.length > 0) {
        const failedResults = result.results.filter(r => !r.success);
        console.log("Mislukte conversies details:", failedResults);

        // Groepeer de redenen
        const reasons = {};
        failedResults.forEach(item => {
          reasons[item.message] = (reasons[item.message] || 0) + 1;
        });
        console.log("Redenen voor mislukte conversies:", reasons);
      }

      // De rest van je functie...
      setConversionResults(result.results);
      setSelectedFiles([]);

      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar PNG.`);

        setTimeout(async () => {
          console.log("Bestanden opnieuw ophalen na conversie...");
          const response = await fetchImages.fetchFiles();
          console.log("Nieuwe bestandsgegevens:", response.data.map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            mime: file.mime // Check of 'mime' beschikbaar is hier
          })));
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

  console.log("PNG conversie voltooid. Resultaten:", {
    totalConverted: conversionResults.filter(r => r.success).length,
    totalFailed: conversionResults.filter(r => !r.success).length // Let op het ! teken
  });

  const img2jpg = async () => {
    if (selectedFiles.length === 0) {
      showNotification('warning', 'Geen bestanden geselecteerd voor conversie.');
      return;
    }

    console.log("Geselecteerde bestanden voor JPG conversie:", selectedFiles);

    selectedFiles.forEach(file => {
      const fullFileInfo = files.find(f => f.id === file.id);
      console.log(`Bestand: ${file.name}, Type: ${fullFileInfo?.type || 'onbekend'}`);
    });

    try {
      const backendEndpoint = '/img-webp/convert-to-jpg';
      console.log("API endpoint:", backendEndpoint);

      const requestBody = JSON.stringify({ files: selectedFiles });
      console.log("Request body:", requestBody);

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        showNotification('danger', `Fout bij het verwerken van de response: ${e.message}`);
        return;
      }

      console.log("Volledige resultaten:", result);
      console.log("Individuele resultaten:", result.results);
      console.log("Succesvolle conversies:", result.totalConverted);
      console.log("Mislukte conversies:", result.totalFailed);

      if (result.results && result.results.length > 0) {
        const failedResults = result.results.filter(r => !r.success);
        console.log("Mislukte conversies details:", failedResults);

        const reasons = {};
        failedResults.forEach(item => {
          reasons[item.message] = (reasons[item.message] || 0) + 1;
        });
        console.log("Redenen voor mislukte conversies:", reasons);
      }

      setConversionResults(result.results);
      setSelectedFiles([]);

      if (result.totalConverted > 0) {
        showNotification('success', `${result.totalConverted} bestanden succesvol geconverteerd naar JPG.`);

        setTimeout(async () => {
          console.log("Bestanden opnieuw ophalen na conversie...");
          const response = await fetchImages.fetchFiles();
          console.log("Nieuwe bestandsgegevens:", response.data.map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            mime: file.mime // Check of 'mime' beschikbaar is hier
          })));
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

  return (
    <MainBox>
      {showAlert && (
        <Box padding={4}>
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
        </Box>
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
