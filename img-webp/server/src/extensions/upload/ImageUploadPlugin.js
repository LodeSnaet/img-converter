const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = (plugin) => {
  const originalAfterCreate = plugin.services['image-manipulation'].upload;
  const originalAfterCreateMany = plugin.services.upload.uploadFiles;

  // Vervang de originele afbeeldingsupload functie
  plugin.services['image-manipulation'].upload = async (file) => {
    // Roep eerst de originele functie aan
    const uploadResult = await originalAfterCreate(file);
    
    // Controleer of automatische conversie is ingeschakeld
    const storedValue = await strapi.store({
      type: 'plugin',
      name: 'img-webp',
      key: 'autoConvertEnabled'
    }).get();
    
    const autoConvertEnabled = storedValue?.value === true;
    
    // Als autoconvert uitgeschakeld is, doe niets extra
    if (!autoConvertEnabled) {
      return uploadResult;
    }
    
    // Voer hier je conversielogica uit (vergelijkbaar met je convertToWebp functie)
    // ...
    
    return uploadResult;
  };

  // Vervang de functie voor meerdere bestanden
  plugin.services.upload.uploadFiles = async (files) => {
    // Roep eerst de originele functie aan
    const uploadResults = await originalAfterCreateMany(files);
    
    // Controleer of automatische conversie is ingeschakeld
    const storedValue = await strapi.store({
      type: 'plugin',
      name: 'img-webp',
      key: 'autoConvertEnabled'
    }).get();
    
    const autoConvertEnabled = storedValue?.value === true;
    
    // Als autoconvert uitgeschakeld is, doe niets extra
    if (!autoConvertEnabled) {
      return uploadResults;
    }
    
    // Voer hier je conversielogica uit voor alle bestanden
    // ...
    
    return uploadResults;
  };

  return plugin;
};