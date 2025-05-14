import utilsImages from './utils-images';

const fetchImages = {
 fetchFiles: async () => {
    try {
      const response = await fetch(`/img-webp/files`); // Use your actual plugin ID and route path

      if (!response.ok) {
        // Handle non-200 responses, maybe throw an error
        const errorData = await response.json(); // Try to parse error details
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`);
      }

      const data = await response.json();

      console.log('Fetched raw data from backend: ', data); // Log the full response data

      // Validate the structure: expect an object with a 'data' array
      if (data && Array.isArray(data.data)) {

        const images = data.data.map(file => ({
          id: file.id,
          name: file.name || file.fileName, // Use fileName as fallback
          url: file.url,
          mime: file.mime,
          type: utilsImages.determineFileType(file.mime),
        })).filter(file => file.type !== 'N/A');

        return { data: images };
      } else {
        console.error('Unexpected response structure from /img-webp/files:', data);
        return { data: [] };
      }

    } catch (err) {
      console.error('Error fetching files:', err);
      return { data: [] };
    }
  },
 fetchSelectedFiles: async () => {
    try {
      const response = await fetch('/img-webp/selected-files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', // Still good practice
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' })); // Try parsing, fallback if not JSON
        const errorMessage = `Failed to fetch selected files: ${response.status} ${errorData.message || response.statusText}`;
        console.error(errorMessage, errorData);
        throw new Error(errorMessage); // Throw error for component to catch
      }

      const result = await response.json();
      // Assume backend GET returns { files: [...] } as per your snippet
      return result;

    } catch (error) {
      console.error('Error in fetchSelectedFiles:', error);
      throw error; // Re-throw for the caller
    }
  }
};

export default fetchImages;
