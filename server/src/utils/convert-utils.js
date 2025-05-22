// server/src/utils/convert-utils.js
const convertUtils = {
  shouldConvert: (currentMime, target) => {
    // console.log(`Server-side conversie check - MIME: ${currentMime}, Target: ${target}`);

    // Als de huidige MIME niet bekend is, kunnen we niet converteren
    if (!currentMime) {
      // console.log('Geen MIME type beschikbaar');
      return false;
    }

    // Als het al het doelformaat is, niet converteren
    if ((currentMime === 'image/webp' && target === 'webp') ||
      (currentMime === 'image/png' && target === 'png') ||
      ((currentMime === 'image/jpeg' || currentMime === 'image/jpg') && target === 'jpg')) {
      // console.log('Bestand is al in doelformaat');
      return false;
    }

    // Toegestane conversies
    const targetMap = {
      webp: ['image/png', 'image/jpeg', 'image/jpg'],
      png: ['image/jpeg', 'image/jpg', 'image/webp'],
      jpg: ['image/png', 'image/webp']
    };

    const canConvert = targetMap[target]?.includes(currentMime);
    // console.log(`Kan converteren: ${canConvert}`);
    return canConvert;
  }
};

module.exports = convertUtils;
