// server/src/bootstrap.js
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = ({ strapi }) => {
  // Nu kun je veilig toegang krijgen tot de plugin omdat die volledig geregistreerd is
  try {
    // HIER kun je wel veilig strapi.plugin gebruiken
    console.log('[IMG-WEBP] Bootstrap: MediaEvents beschikbaar gemaakt via plugin API');

    // Upload lifecycles
    strapi.db.lifecycles.subscribe({
      models: ['plugin::upload.file'],

      async afterCreate(event) {
        const storedValue = await strapi
          .store({
            type: 'plugin',
            name: 'img-webp',
            key: 'autoConvertEnabled',
          })
          .get();

        if (storedValue === true) {
          // Controleer of het een afbeeldingsbestand is dat we willen converteren
          const fileData = event.result;
          if (!fileData || !fileData.mime || !fileData.mime.startsWith('image/')) return;

          // Sluit SVG's en al bestaande WebP's uit
          if (fileData.mime === 'image/svg+xml' || fileData.mime === 'image/webp') return;

          try {
            // Pad naar het originele bestand
            const publicDir = strapi.dirs.static.public;
            const originalUrl = fileData.url;
            const originalPath = path.join(
              publicDir,
              originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl
            );

            // Controleer of het originele bestand bestaat
            if (!fs.existsSync(originalPath)) {
              console.error(`[IMG-WEBP] Bestand niet gevonden: ${originalPath}`);
              return;
            }

            // Bereid het WebP pad voor
            const originalExt = path.extname(originalPath);
            const originalName = path.basename(originalPath, originalExt);
            const originalDir = path.dirname(originalPath);
            const webpName = originalName + '.webp';
            const webpPath = path.join(originalDir, webpName);
            const webpUrl = originalUrl.replace(originalExt, '.webp');

            // Voer de conversie uit
            await sharp(originalPath)
              .webp({
                quality: 85,
                lossless: false,
                effort: 4,
              })
              .toFile(webpPath);

            // Update de database met nieuwe bestandsgegevens
            const fileSize = fs.statSync(webpPath).size;
            await strapi.entityService.update('plugin::upload.file', fileData.id, {
              data: {
                name: webpName,
                ext: '.webp',
                mime: 'image/webp',
                url: webpUrl,
                size: fileSize,
              },
            });

            // Verwijder het originele bestand (optioneel)
            fs.unlinkSync(originalPath);

            console.log(`[IMG-WEBP] Bestand geconverteerd: ${fileData.name} -> ${webpName}`);
          } catch (error) {
            console.error(`[IMG-WEBP] Fout bij conversie: ${error.message}`);
          }
        } else {
          console.log('[IMG-WEBP] Auto-conversie is uitgeschakeld');
          return;
        }
      }
    });
  } catch (error) {
    console.error('[IMG-WEBP] Bootstrap error:', error);
  }
};
