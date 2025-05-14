const utilsImages = {
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
  },
  determineFileType: (mime) => {
    try {
      const excludeTypes = ['image/svg+xml', 'video/mp4', 'image/gif','application/pdf'];
      if (excludeTypes.includes(mime)) {
        return null;
      }
      switch (mime) {
        case 'image/png':
          return 'PNG';
        case 'image/jpg':
          return 'JPG';
        case 'image/jpeg':
          return 'JPG';
        case 'image/webp':
          return 'WEBP';
        default:
          return 'OTHER';
      }
    } catch (err) {
      console.log(500, 'Fout bij detecteren bestandsformaat');
    }
  }

}

export default utilsImages;
