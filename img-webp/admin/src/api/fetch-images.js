const convertApi = {
  determineFileType: (mime)=> {
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
        case 'image/webp':
          return 'WEBP';
        default:
          return 'OTHER';
      }
    } catch (err) {
      console.log(500, 'Fout bij detecteren bestandsformaat');
    }
  },

  fetchFiles: async () => {
    try {
      const timestamp = Date.now();

      const response = await fetch(`/v1/upload/files?_=${timestamp}`);
      const data = await response.json();

      const images = data
        .map(file => ({
          id: file.id,
          name: file.name || file.fileName,
          url: file.url,
          mime: file.mime,
          type: convertApi.determineFileType(file.mime),
        }))
        .filter(file => file.type !== null);

      return { data: images };
    } catch (err) {
      console.log(500, 'Fout bij ophalen bestanden');
    }
  },
  shouldConvert: (currentMime, target) => {
    const targetMap = {
      webp: ['image/png', 'image/jpeg'],
      png: ['image/jpeg', 'image/webp'],
      jpg: ['image/png', 'image/webp']
    };
    return targetMap[target]?.includes(currentMime);
  }
};

export default convertApi;
