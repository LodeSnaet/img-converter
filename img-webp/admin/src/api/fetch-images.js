const convertApi = {
  fetchFiles: async () => {
    try {
      const response = await fetch('/v1/upload/files');
      const data = await response.json();

      const images = data
        .map(file => ({
          id: file.id,
          name: file.name || file.fileName,
          url: file.url,
          fileFormat: determineFileType(file.mime),
        }))
        .filter(file => file.fileFormat !== null);


      return { data: images };
    } catch (err) {
      console.log(500, 'Fout bij ophalen bestanden');
    }
  }
};

function determineFileType(mime) {
  const excludeTypes = ['image/svg+xml', 'video/mp4', 'video/webm', 'image/gif'];
  if (excludeTypes.includes(mime)) {
    return null; // of 'EXCLUDE'
  }
  switch (mime) {
    case 'image/png':
      return 'PNG';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPG';
    case 'image/webp':
      return 'WEBP';
    default:
      return 'OTHER';
  }
}

export default convertApi;
