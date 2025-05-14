// server/config/plugins.js
module.exports = {
  upload: {
    config: {
      autoWebp: {
        enabled: true,
        quality: 85, // 0-100
        lossless: false,
        effort: 4, // 0-6
        // Optioneel: Geef aan welke bestandstypen moeten worden geconverteerd
        convertTypes: ['.jpg', '.jpeg', '.png'],
      }
    }
  }
};
