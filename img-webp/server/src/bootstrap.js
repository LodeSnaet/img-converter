// server/src/bootstrap.js
module.exports = ({ strapi }) => {
  // Import afhankelijkheden
  const fs = require('fs');
  const path = require('path');
  const sharp = require('sharp');

  // Gemeenschappelijke conversiefunctie
  const convertFileToWebp = async (fileData) => {
    // Controleer of het een afbeeldingsbestand is dat we willen converteren
    if (!fileData || !fileData.mime || !fileData.mime.startsWith('image/')) {
      console.log(`[IMG-WEBP] Bestand is geen afbeelding of heeft geen MIME type: ${fileData?.name}`);
      return false;
    }

    // Sluit SVG's en al bestaande WebP's uit
    if (fileData.mime === 'image/svg+xml' || fileData.mime === 'image/webp') {
      console.log(`[IMG-WEBP] Bestand is al WebP of SVG, geen conversie nodig: ${fileData.name}`);
      return false;
    }

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
        return false;
      }

      // Bereid het WebP pad voor
      const originalExt = path.extname(originalPath);
      const originalName = path.basename(originalPath, originalExt);
      const originalDir = path.dirname(originalPath);
      const webpName = originalName + '.webp';
      const webpPath = path.join(originalDir, webpName);
      const webpUrl = originalUrl.replace(originalExt, '.webp');

      // Voer de conversie uit - gebruik een uniek pad om botsingen te voorkomen
      const tempWebpPath = webpPath + '.temp_' + Date.now();

      await sharp(originalPath, { failOnError: false })
        .webp({
          quality: 85,
          lossless: false,
          effort: 4,
        })
        .toFile(tempWebpPath);

      // Update de database eerst met nieuwe bestandsgegevens
      const fileSize = fs.statSync(tempWebpPath).size;
      await strapi.entityService.update('plugin::upload.file', fileData.id, {
        data: {
          name: webpName,
          ext: '.webp',
          mime: 'image/webp',
          url: webpUrl,
          size: fileSize,
        },
      });

      // Hernoem het tijdelijke bestand naar het definitieve bestand
      // Dit staat los van het verwijderen van het origineel
      try {
        if (fs.existsSync(webpPath)) {
          fs.unlinkSync(webpPath); // Verwijder bestaand webp-bestand als het bestaat
        }
        fs.renameSync(tempWebpPath, webpPath);
      } catch (renameError) {
        console.error(`[IMG-WEBP] Fout bij hernoemen van temp bestand: ${renameError.message}`);
      }

      // Probeer het originele bestand te verwijderen, maar ga door als het mislukt
      try {
        if (fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }
      } catch (deleteError) {
        console.warn(`[IMG-WEBP] Kon het originele bestand niet verwijderen: ${deleteError.message}`);
        // We gaan door, zelfs als verwijderen mislukt
      }

      console.log(`[IMG-WEBP] Bestand geconverteerd: ${fileData.name} -> ${webpName}`);
      return true;
    } catch (error) {
      console.error(`[IMG-WEBP] Fout bij conversie van bestand ${fileData.name}: ${error.message}`);
      return false;
    }
  };

  // Haal de auto-convert instelling op
  const getAutoConvertSetting = async () => {
    try {
      const storedValue = await strapi
        .store({
          type: 'plugin',
          name: 'img-webp',
          key: 'autoConvertEnabled',
        })
        .get();

      return storedValue?.value === true;
    } catch (error) {
      console.error('[IMG-WEBP] Fout bij ophalen van autoConvert instelling:', error);
      return false; // Veilige standaardwaarde is uitgeschakeld
    }
  };

  // Gebruik één lifecycle abonnement voor beide events
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],

    // Voor enkele bestanden
    async afterCreate(event) {
      try {
        // Door een kleine vertraging toe te voegen, geven we het OS tijd om bestanden vrij te geven
        await new Promise(resolve => setTimeout(resolve, 100));

        // Controleer of auto-convert is ingeschakeld
        const autoConvertEnabled = await getAutoConvertSetting();
        console.log('[AUTO-CONVERT] Auto convert enabled:', autoConvertEnabled);

        if (!autoConvertEnabled) {
          console.log('[AUTO-CONVERT] Auto convert is uitgeschakeld, geen actie ondernomen');
          return;
        }

        // Verwerk één bestand
        const fileData = event.result;
        if (!fileData) {
          console.log('[AUTO-CONVERT] Geen bestandsgegevens gevonden in event.result');
          return;
        }

        await convertFileToWebp(fileData);
      } catch (error) {
        console.error('[IMG-WEBP] Fout in afterCreate hook:', error);
        // Laat de hook niet falen door een fout
      }
    },

    // Voor meerdere bestanden
    async afterCreateMany(event) {
      try {
        // Kleine vertraging om bestandsprocessen te laten afronden
        await new Promise(resolve => setTimeout(resolve, 200));

        // Controleer of auto-convert is ingeschakeld
        const autoConvertEnabled = await getAutoConvertSetting();
        console.log('[AUTO-CONVERT] Auto convert enabled (many):', autoConvertEnabled);

        // Als auto-convert uitgeschakeld is, doen we niets
        if (!autoConvertEnabled) {
          console.log('[AUTO-CONVERT] Auto convert is uitgeschakeld, geen actie ondernomen voor meerdere bestanden');
          return;
        }

        // Controleer of er resultaten zijn
        if (!event.result || !Array.isArray(event.result) || event.result.length === 0) {
          console.log('[AUTO-CONVERT] Geen bestanden om te verwerken in afterCreateMany');
          return;
        }

        console.log(`[AUTO-CONVERT] Verwerken van ${event.result.length} bestanden in afterCreateMany`);

        // Verwerk bestanden sequentieel, niet parallel om gelijktijdige bestandstoegang te vermijden
        for (const fileData of event.result) {
          // Kleine pauze tussen elk bestand
          await new Promise(resolve => setTimeout(resolve, 50));
          await convertFileToWebp(fileData);
        }
      } catch (error) {
        console.error('[IMG-WEBP] Fout in afterCreateMany hook:', error);
        // Laat de hook niet falen door een fout
      }
    }
  });
};
