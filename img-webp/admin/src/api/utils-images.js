const utilsImages = {
  // Bijwerken van utilsImages functies
  hasConvertibleFilesForWEBP: (checkedFiles, files) => {
    if (checkedFiles.length === 0) return false;

    return checkedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar WebP kan worden geconverteerd
      return (
        fullFile.mime.startsWith('image/') &&
        fullFile.mime !== 'image/webp' &&
        fullFile.mime !== 'image/svg+xml' // Typically SVG is not converted to WebP
      );
    });
  },

  hasConvertibleFilesForPNG: (checkedFiles, files) => {
    if (checkedFiles.length === 0) return false;

    return checkedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar PNG kan worden geconverteerd
      // Allow conversion from JPG and WebP to PNG, but not from SVG or PNG itself
      return (
        fullFile.mime.startsWith('image/') &&
        fullFile.mime !== 'image/png' &&
        fullFile.mime !== 'image/svg+xml'
      );
    });
  },

  hasConvertibleFilesForJPG: (checkedFiles, files) => {
    if (checkedFiles.length === 0) return false;

    return checkedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een PNG of WebP afbeelding is die naar JPG kan worden geconverteerd
      return (
        fullFile.mime === 'image/png' ||
        fullFile.mime === 'image/webp'
      );
    });
  }
}

export default utilsImages;
