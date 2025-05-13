const utilsImages = {
  // Bijwerken van utilsImages functies
  hasConvertibleFilesForWebP: (checkedFiles, files) => {
    if (checkedFiles.length === 0) return false;

    return checkedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar WebP kan worden geconverteerd
      return (
        fullFile.mime.startsWith('image/') &&
        fullFile.mime !== 'image/webp' &&
        fullFile.mime !== 'image/svg+xml'
      );
    });
  },

  hasConvertibleFilesForPNG: (checkedFiles, files) => {
    if (checkedFiles.length === 0) return false;

    return checkedFiles.some(selectedFile => {
      const fullFile = files.find(f => f.id === selectedFile.id);
      if (!fullFile || !fullFile.mime) return false;

      // Controleer of het een afbeelding is die naar PNG kan worden geconverteerd
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

      // Controleer of het een afbeelding is die naar JPG kan worden geconverteerd
      return (
        fullFile.mime.startsWith('image/') &&
        fullFile.mime !== 'image/jpeg' &&
        fullFile.mime !== 'image/jpg'
      );
    });
  }
}

export default utilsImages;
