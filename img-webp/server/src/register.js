// server/src/register.js
'use strict';

const utils = require('./utils');

module.exports = ({ strapi }) => {
  console.log('[IMG-WEBP] Register functie wordt uitgevoerd');

  // Hier registreren we de media event listeners
  try {
    const mediaEvents = utils.mediaEventListeners(strapi);

    // Sla de event listeners op voor later gebruik
    // OPMERKING: Je kunt strapi.plugins alleen gebruiken nadat de plugin volledig is geregistreerd
    // Dus dit gedeelte kan problemen veroorzaken als het te vroeg wordt uitgevoerd

    // Alternatieve aanpak: sla het op in een globale variabele voor later gebruik
    global.imgWebpMediaEvents = mediaEvents;

    console.log('[IMG-WEBP] Media event registratie voltooid');
  } catch (error) {
    console.error('[IMG-WEBP] Fout bij registreren media events:', error);
  }
};
