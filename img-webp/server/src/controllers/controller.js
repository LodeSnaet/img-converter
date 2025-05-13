const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
import convertUtils from '../utils/convert-utils';

const createControllerMethods = ({ strapi }) => ({
  // Existing method
  index(ctx) {
    ctx.body = strapi
      .plugin('img-webp')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
  async autoWebp(ctx) {
    try {
      // Controleer of er een bestandsupload is
      if (!ctx.request.files || !ctx.request.files.files) {
        return ctx.badRequest('Geen bestand geüpload');
      }

      const files = Array.isArray(ctx.request.files.files)
        ? ctx.request.files.files
        : [ctx.request.files.files];

      const results = [];

      // Verwerk elk bestand
      for (const file of files) {
        // Controleer of het bestand een jpg of png is
        if (file.type.startsWith('image/') &&
          (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png'))) {

          try {
            // Lees het bestand
            const buffer = fs.readFileSync(file.path);

            // Maak een nieuw bestandspad voor het WEBP-bestand
            const fileInfo = path.parse(file.name);
            const webpFilename = `${fileInfo.name}.webp`;
            const webpPath = path.join(path.dirname(file.path), webpFilename);

            // Converteer naar WEBP
            await sharp(buffer)
              .webp({ quality: 85 })
              .toFile(webpPath);

            // Voeg het resultaat toe
            results.push({
              originalFile: file.name,
              convertedFile: webpFilename,
              success: true,
              path: webpPath
            });
          } catch (error) {
            results.push({
              originalFile: file.name,
              success: false,
              error: error.message
            });
          }
        } else {
          results.push({
            originalFile: file.name,
            success: false,
            error: 'Bestand is geen JPG of PNG'
          });
        }
      }

      return ctx.send({
        message: 'Verwerking voltooid',
        results
      });
    } catch (error) {
      return ctx.badRequest(`Verwerking mislukt: ${error.message}`);
    }
  },

  async convertToWebp(ctx) {
    try {
      console.log("WebP conversie gestart");
      const { files } = ctx.request.body;
      console.log("Ontvangen bestanden voor WebP conversie:", files);

      if (!files || !Array.isArray(files) || files.length === 0) {
        return ctx.badRequest('Geen bestanden geselecteerd voor conversie');
      }

      const conversionResults = [];

      // Verwerk elk bestand
      for (const file of files) {
        try {
          // Haal de volledige bestandsgegevens op
          const fileData = await strapi.entityService.findOne('plugin::upload.file', file.id, {
            populate: '*'  // Zorg ervoor dat we alle gerelateerde data krijgen
          });
          console.log(`Bestand ID: ${file.id}, Naam: ${file.name}, MIME: ${fileData?.mime}`);

          if (!fileData) {
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: 'Bestand niet gevonden in database'
            });
            continue;
          }

          // Controleer alleen of het bestand al WebP is, accepteer alle andere afbeeldingstypen
          if (convertUtils.shouldConvert(fileData.mime, 'webp')) {
            // De rest van je code voor conversie...
            const publicDir = strapi.dirs.static.public;
            const originalUrl = fileData.url;
            const originalPath = path.join(publicDir, originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl);
            const originalExt = path.extname(originalPath);
            const originalName = path.basename(originalPath, originalExt);
            const originalDir = path.dirname(originalPath);

            const webpName = originalName + '.webp';
            const webpPath = path.join(originalDir, webpName);
            const webpUrl = originalUrl.replace(originalExt, '.webp');

            console.log('Origineel pad:', originalPath);
            console.log('WebP pad:', webpPath);
            console.log('WebP URL:', webpUrl);

            if (!fs.existsSync(originalPath)) {
              conversionResults.push({
                id: file.id,
                name: file.name,
                success: false,
                message: `Origineel bestand niet gevonden op schijf: ${originalPath}`
              });
              continue;
            }

            try {
              // Lees de oorspronkelijke afbeelding in
              const imageBuffer = fs.readFileSync(originalPath);
              const sharpImage = sharp(imageBuffer);

              // Converteer het oorspronkelijke bestand naar WebP
              await sharpImage
                .webp({
                  quality: 80,
                  lossless: false,
                  nearLossless: false,
                  smartSubsample: true
                })
                .toFile(webpPath);

              // Bereid de nieuwe formats object voor
              const newFormats = {};

              // Converteer alle formaten als ze bestaan
              if (fileData.formats) {
                console.log("Converteren van afgeleide versies...");

                for (const [formatName, formatData] of Object.entries(fileData.formats)) {
                  if (formatData && formatData.url) {
                    const formatUrl = formatData.url;
                    const formatPath = path.join(publicDir, formatUrl.startsWith('/') ? formatUrl.substring(1) : formatUrl);
                    const formatExt = path.extname(formatPath);
                    const formatBaseName = path.basename(formatPath, formatExt);
                    const formatDir = path.dirname(formatPath);

                    const newFormatName = formatBaseName + '.webp';
                    const newFormatPath = path.join(formatDir, newFormatName);
                    const newFormatUrl = formatUrl.replace(formatExt, '.webp');

                    console.log(`Converteren van formaat ${formatName}: ${formatPath} -> ${newFormatPath}`);

                    if (fs.existsSync(formatPath)) {
                      try {
                        // Converteer de afgeleide afbeelding
                        await sharp(formatPath)
                          .webp({
                            quality: 80,
                            lossless: false,
                            nearLossless: false,
                            smartSubsample: true
                          })
                          .toFile(newFormatPath);

                        // Verwijder het oude formaat bestand
                        fs.unlinkSync(formatPath);

                        // Bijwerken van het format object
                        newFormats[formatName] = {
                          ...formatData,
                          ext: '.webp',
                          mime: 'image/webp',
                          name: newFormatName,
                          path: newFormatUrl.substring(1), // Verwijder voorste slash
                          url: newFormatUrl,
                          size: fs.statSync(newFormatPath).size,
                        };
                      } catch (formatError) {
                        console.error(`Fout bij converteren van formaat ${formatName}:`, formatError);
                      }
                    } else {
                      console.warn(`Formaat bestand niet gevonden: ${formatPath}`);
                    }
                  }
                }
              }

              // Update het bestand in de database met alle nieuwe informatie
              const fileSize = fs.statSync(webpPath).size;
              await strapi.entityService.update('plugin::upload.file', file.id, {
                data: {
                  name: webpName,
                  ext: '.webp',
                  mime: 'image/webp',
                  url: webpUrl,
                  size: fileSize,
                  formats: Object.keys(newFormats).length > 0 ? newFormats : null,
                }
              });

              // Verwijder het oorspronkelijke bestand NA de database-update
              fs.unlinkSync(originalPath);

              conversionResults.push({
                id: file.id,
                name: file.name,
                success: true,
                newName: webpName,
                newUrl: webpUrl
              });
            } catch (conversionError) {
              console.error('Fout bij conversie:', conversionError);
              conversionResults.push({
                id: file.id,
                name: file.name,
                success: false,
                message: `Conversiefout: ${conversionError.message}`
              });
            }
          } else {
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: fileData.mime === 'image/webp' ?
                'Bestand is al in WebP-formaat' :
                'Bestandstype niet ondersteund voor conversie'
            });
          }
        } catch (fileError) {
          console.error(`Fout bij verwerken van bestand ${file.name}:`, fileError);
          conversionResults.push({
            id: file.id,
            name: file.name,
            success: false,
            message: `Fout: ${fileError.message}`
          });
        }
      }

      // Stuur een signaal naar de Strapi admin om de mediabibliotheek te vernieuwen
      try {
        strapi.eventHub.emit('media-library.assets.refresh');
      } catch (err) {
        console.error("Fout bij vernieuwen van media library:", err);
      }

      console.log("WebP conversie voltooid. Resultaten:", {
        totalConverted: conversionResults.filter(r => r.success).length,
        totalFailed: conversionResults.filter(r => !r.success).length
      });

      return ctx.send({
        message: 'Beeldconversieproces voltooid.',
        results: conversionResults,
        totalConverted: conversionResults.filter(r => r.success).length,
        totalFailed: conversionResults.filter(r => !r.success).length,
      }, 200);

    } catch (error) {
      console.error('Fout bij beeldconversie:', error);
      return ctx.badRequest(`Fout bij beeldconversie: ${error.message}`);
    }
  },
  async convertToPng(ctx) {
  try {
    console.log("PNG conversie gestart");
    const { files } = ctx.request.body;
    console.log("Ontvangen bestanden voor PNG conversie:", files);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return ctx.badRequest('Geen bestanden geselecteerd voor conversie');
    }

    const conversionResults = [];

    // Verwerk elk bestand
    for (const file of files) {
      try {
        // Haal de volledige bestandsgegevens op, inclusief formats
        const fileData = await strapi.entityService.findOne('plugin::upload.file', file.id, {
          populate: '*'  // Zorg ervoor dat we alle gerelateerde data krijgen
        });
        console.log(`Bestand ID: ${file.id}, Naam: ${file.name}, MIME: ${fileData?.mime}`);

        if (!fileData) {
          conversionResults.push({
            id: file.id,
            name: file.name,
            success: false,
            message: 'Bestand niet gevonden in database'
          });
          continue;
        }

        // Controleer of het bestand geconverteerd kan worden
        if (convertUtils.shouldConvert(fileData.mime, 'png')) {
          const publicDir = strapi.dirs.static.public;
          const originalUrl = fileData.url;
          const originalPath = path.join(publicDir, originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl);
          const originalExt = path.extname(originalPath);
          const originalName = path.basename(originalPath, originalExt);
          const originalDir = path.dirname(originalPath);

          const pngName = originalName + '.png';
          const pngPath = path.join(originalDir, pngName);
          const pngUrl = originalUrl.replace(originalExt, '.png');

          console.log('Origineel pad:', originalPath);
          console.log('PNG pad:', pngPath);
          console.log('PNG URL:', pngUrl);

          if (!fs.existsSync(originalPath)) {
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: `Origineel bestand niet gevonden op schijf: ${originalPath}`
            });
            continue;
          }

          try {
            // Lees de oorspronkelijke afbeelding in
            const imageBuffer = fs.readFileSync(originalPath);
            const sharpImage = sharp(imageBuffer);

            // Converteer het oorspronkelijke bestand naar PNG
            await sharpImage
              .png({
                quality: 100,
                compressionLevel: 6
              })
              .toFile(pngPath);

            // Bereid de nieuwe formats object voor
            const newFormats = {};

            // Converteer alle formaten als ze bestaan
            if (fileData.formats) {
              console.log("Converteren van afgeleide versies...");

              for (const [formatName, formatData] of Object.entries(fileData.formats)) {
                if (formatData && formatData.url) {
                  const formatUrl = formatData.url;
                  const formatPath = path.join(publicDir, formatUrl.startsWith('/') ? formatUrl.substring(1) : formatUrl);
                  const formatExt = path.extname(formatPath);
                  const formatBaseName = path.basename(formatPath, formatExt);
                  const formatDir = path.dirname(formatPath);

                  const newFormatName = formatBaseName + '.png';
                  const newFormatPath = path.join(formatDir, newFormatName);
                  const newFormatUrl = formatUrl.replace(formatExt, '.png');

                  console.log(`Converteren van formaat ${formatName}: ${formatPath} -> ${newFormatPath}`);

                  if (fs.existsSync(formatPath)) {
                    try {
                      // Converteer de afgeleide afbeelding
                      await sharp(formatPath)
                        .png({
                          quality: 100,
                          compressionLevel: 6
                        })
                        .toFile(newFormatPath);

                      // Verwijder het oude formaat bestand
                      fs.unlinkSync(formatPath);

                      // Bijwerken van het format object
                      newFormats[formatName] = {
                        ...formatData,
                        ext: '.png',
                        mime: 'image/png',
                        name: newFormatName,
                        path: newFormatUrl.substring(1), // Verwijder voorste slash
                        url: newFormatUrl,
                        size: fs.statSync(newFormatPath).size,
                      };
                    } catch (formatError) {
                      console.error(`Fout bij converteren van formaat ${formatName}:`, formatError);
                    }
                  } else {
                    console.warn(`Formaat bestand niet gevonden: ${formatPath}`);
                  }
                }
              }
            }

            // Update het bestand in de database met alle nieuwe informatie
            const fileSize = fs.statSync(pngPath).size;
            await strapi.entityService.update('plugin::upload.file', file.id, {
              data: {
                name: pngName,
                ext: '.png',
                mime: 'image/png',
                url: pngUrl,
                size: fileSize,
                formats: Object.keys(newFormats).length > 0 ? newFormats : null,
              }
            });

            // Verwijder het oorspronkelijke bestand NA de database-update
            fs.unlinkSync(originalPath);

            conversionResults.push({
              id: file.id,
              name: file.name,
              success: true,
              newName: pngName,
              newUrl: pngUrl
            });
          } catch (conversionError) {
            console.error('Fout bij conversie:', conversionError);
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: `Conversiefout: ${conversionError.message}`
            });
          }
        } else {
          conversionResults.push({
            id: file.id,
            name: file.name,
            success: false,
            message: fileData.mime === 'image/png' ?
              'Bestand is al in PNG-formaat' :
              'Bestandstype niet ondersteund voor conversie'
          });
        }
      } catch (fileError) {
        console.error(`Fout bij verwerken van bestand ${file.name}:`, fileError);
        conversionResults.push({
          id: file.id,
          name: file.name,
          success: false,
          message: `Fout: ${fileError.message}`
        });
      }
    }

    // Stuur een signaal naar de Strapi admin om de mediabibliotheek te vernieuwen
    try {
      strapi.eventHub.emit('media-library.assets.refresh');
    } catch (err) {
      console.error("Fout bij vernieuwen van media library:", err);
    }

    // Fix de bug met totalFailed
    console.log("PNG conversie voltooid. Resultaten:", {
      totalConverted: conversionResults.filter(r => r.success).length,
      totalFailed: conversionResults.filter(r => !r.success).length // Correctie hier
    });

    return ctx.send({
      message: 'PNG conversieproces voltooid.',
      results: conversionResults,
      totalConverted: conversionResults.filter(r => r.success).length,
      totalFailed: conversionResults.filter(r => !r.success).length, // En hier
    }, 200);

  } catch (error) {
    console.error('Fout bij PNG conversie:', error);
    return ctx.badRequest(`Fout bij PNG conversie: ${error.message}`);
  }
},
  async convertToJpg(ctx) {
  try {
    console.log("JPG conversie gestart");
    const { files } = ctx.request.body;
    console.log("Ontvangen bestanden voor JPG conversie:", files);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return ctx.badRequest('Geen bestanden geselecteerd voor conversie');
    }

    const conversionResults = [];

    // Verwerk elk bestand
    for (const file of files) {
      try {
        // Haal de volledige bestandsgegevens op, inclusief formats
        const fileData = await strapi.entityService.findOne('plugin::upload.file', file.id, {
          populate: '*'  // Zorg ervoor dat we alle gerelateerde data krijgen
        });
        console.log(`Bestand ID: ${file.id}, Naam: ${file.name}, MIME: ${fileData?.mime}`);

        if (!fileData) {
          conversionResults.push({
            id: file.id,
            name: file.name,
            success: false,
            message: 'Bestand niet gevonden in database'
          });
          continue;
        }

        // Controleer of het bestand geconverteerd kan worden
        if (convertUtils.shouldConvert(fileData.mime, 'jpg')) {
          const publicDir = strapi.dirs.static.public;
          const originalUrl = fileData.url;
          const originalPath = path.join(publicDir, originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl);
          const originalExt = path.extname(originalPath);
          const originalName = path.basename(originalPath, originalExt);
          const originalDir = path.dirname(originalPath);

          const jpgName = originalName + '.jpg';
          const jpgPath = path.join(originalDir, jpgPath);
          const jpgUrl = originalUrl.replace(originalExt, '.jpg');

          console.log('Origineel pad:', originalPath);
          console.log('JPG pad:', jpgPath);
          console.log('JPG URL:', jpgUrl);

          if (!fs.existsSync(originalPath)) {
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: `Origineel bestand niet gevonden op schijf: ${originalPath}`
            });
            continue;
          }

          try {
            // Lees de oorspronkelijke afbeelding in
            const imageBuffer = fs.readFileSync(originalPath);
            const sharpImage = sharp(imageBuffer);

            // Converteer het oorspronkelijke bestand naar JPG
            await sharpImage
              .jpeg({
                quality: 85,
                progressive: true
              })
              .toFile(jpgPath);

            // Bereid de nieuwe formats object voor
            const newFormats = {};

            // Converteer alle formaten als ze bestaan
            if (fileData.formats) {
              console.log("Converteren van afgeleide versies...");

              for (const [formatName, formatData] of Object.entries(fileData.formats)) {
                if (formatData && formatData.url) {
                  const formatUrl = formatData.url;
                  const formatPath = path.join(publicDir, formatUrl.startsWith('/') ? formatUrl.substring(1) : formatUrl);
                  const formatExt = path.extname(formatPath);
                  const formatBaseName = path.basename(formatPath, formatExt);
                  const formatDir = path.dirname(formatPath);

                  const newFormatName = formatBaseName + '.jpg';
                  const newFormatPath = path.join(formatDir, newFormatName);
                  const newFormatUrl = formatUrl.replace(formatExt, '.jpg');

                  console.log(`Converteren van formaat ${formatName}: ${formatPath} -> ${newFormatPath}`);

                  if (fs.existsSync(formatPath)) {
                    try {
                      // Converteer de afgeleide afbeelding
                      await sharp(formatPath)
                        .jpeg({
                          quality: 85,
                          progressive: true
                        })
                        .toFile(newFormatPath);

                      // Verwijder het oude formaat bestand
                      fs.unlinkSync(formatPath);

                      // Bijwerken van het format object
                      newFormats[formatName] = {
                        ...formatData,
                        ext: '.jpg',
                        mime: 'image/jpeg',
                        name: newFormatName,
                        path: newFormatUrl.substring(1), // Verwijder voorste slash
                        url: newFormatUrl,
                        size: fs.statSync(newFormatPath).size,
                      };
                    } catch (formatError) {
                      console.error(`Fout bij converteren van formaat ${formatName}:`, formatError);
                    }
                  } else {
                    console.warn(`Formaat bestand niet gevonden: ${formatPath}`);
                  }
                }
              }
            }

            // Update het bestand in de database met alle nieuwe informatie
            const fileSize = fs.statSync(jpgPath).size;
            await strapi.entityService.update('plugin::upload.file', file.id, {
              data: {
                name: jpgName,
                ext: '.jpg',
                mime: 'image/jpeg',
                url: jpgUrl,
                size: fileSize,
                formats: Object.keys(newFormats).length > 0 ? newFormats : null,
              }
            });

            // Verwijder het oorspronkelijke bestand NA de database-update
            fs.unlinkSync(originalPath);

            conversionResults.push({
              id: file.id,
              name: file.name,
              success: true,
              newName: jpgName,
              newUrl: jpgUrl
            });
          } catch (conversionError) {
            console.error('Fout bij conversie:', conversionError);
            conversionResults.push({
              id: file.id,
              name: file.name,
              success: false,
              message: `Conversiefout: ${conversionError.message}`
            });
          }
        } else {
          conversionResults.push({
            id: file.id,
            name: file.name,
            success: false,
            message: fileData.mime === 'image/jpeg' ?
              'Bestand is al in JPG-formaat' :
              'Bestandstype niet ondersteund voor conversie'
          });
        }
      } catch (fileError) {
        console.error(`Fout bij verwerken van bestand ${file.name}:`, fileError);
        conversionResults.push({
          id: file.id,
          name: file.name,
          success: false,
          message: `Fout: ${fileError.message}`
        });
      }
    }

    // Stuur een signaal naar de Strapi admin om de mediabibliotheek te vernieuwen
    try {
      strapi.eventHub.emit('media-library.assets.refresh');
    } catch (err) {
      console.error("Fout bij vernieuwen van media library:", err);
    }

    console.log("JPG conversie voltooid. Resultaten:", {
      totalConverted: conversionResults.filter(r => r.success).length,
      totalFailed: conversionResults.filter(r => !r.success).length
    });

    return ctx.send({
      message: 'JPG conversieproces voltooid.',
      results: conversionResults,
      totalConverted: conversionResults.filter(r => r.success).length,
      totalFailed: conversionResults.filter(r => !r.success).length,
    }, 200);

  } catch (error) {
    console.error('Fout bij JPG conversie:', error);
    return ctx.badRequest(`Fout bij JPG conversie: ${error.message}`);
  }
},
// Voeg deze methodes toe aan je controller object:

  // Schakel de automatische conversie in of uit
  async setAutoConvert(ctx) {
    try {
      const { enabled } = ctx.request.body;

      console.log('Auto convert is:', enabled)


      if (typeof enabled !== 'boolean') {
        return ctx.badRequest('Enabled parameter moet een boolean zijn');
      }

      // Sla de voorkeur op in de plugin configuratie
      await strapi.store({
        type: 'plugin',
        name: 'img-webp',
        key: 'autoConvertEnabled'
      }).set({ value: enabled });

      console.log(`Auto-convert is nu: ${enabled ? 'ingeschakeld' : 'uitgeschakeld'}`);

      return ctx.send({
        enabled,
        message: `Automatische conversie is ${enabled ? 'ingeschakeld' : 'uitgeschakeld'}`
      });
    } catch (error) {
      console.error('Fout bij het instellen van auto-convert:', error);
      return ctx.badRequest(`Fout: ${error.message}`);
    }
  },
  async getAutoConvert(ctx) {
    try {

      // Haal de voorkeur op uit de plugin configuratie
      const storedValue = await strapi.store({
        type: 'plugin',
        name: 'img-webp',
        key: 'autoConvertEnabled'
      }).get();

      // De standaardwaarde is 'false' als er nog niets is opgeslagen
      const enabled = storedValue?.value === true;

      return ctx.send({
        enabled,
      });
    } catch (error) {
      console.error('Fout bij het ophalen van auto-convert status:', error);
      return ctx.badRequest(`Fout: ${error.message}`);
    }
  }
});

export default createControllerMethods;
