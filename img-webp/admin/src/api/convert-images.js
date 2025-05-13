// admin/src/api/convert-images.js

// Removed: import fetchImages from './fetch-images'; // Not used in this file

// Helper function to fetch currently selected files from the backend
// Adjusted to return { files: [...] } to match your original snippet's assumption
const fetchSelectedFiles = async () => {
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
};

const convertImages = {
  img2webp: async () => {
    try {
      const selectedData = await fetchSelectedFiles();
      const filesToConvert = selectedData.files; // Use the structure from your snippet

      // Component will check for empty list and show warning BEFORE calling this
      // But we add a check here defensively
      if (!filesToConvert || filesToConvert.length === 0) {
        // Return a clear indicator that no action was taken
        return { totalConverted: 0, results: [], message: 'No files selected for conversion.', skipped: true };
      }

      const backendEndpoint = '/img-webp/convert-to-webp';

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesToConvert }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        const errorMessage = `Backend conversion API returned an error (${response.status}): ${errorData.message || response.statusText}`;
        console.error(errorMessage, errorData);
        throw new Error(errorMessage); // Throw error
      }

      const result = await response.json();
      // Removed setTimeout and UI logic - Component handles this
      return result; // Return the result for the component

    } catch (error) {
      console.error("Error during WebP conversion API call:", error);
      throw error; // Re-throw the error
    }
  },

  img2png: async () => {
    try {
      const selectedData = await fetchSelectedFiles();
      const filesToConvert = selectedData.files;

      if (!filesToConvert || filesToConvert.length === 0) {
        return { totalConverted: 0, results: [], message: 'No files selected for conversion.', skipped: true };
      }

      const backendEndpoint = '/img-webp/convert-to-png';

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesToConvert }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        const errorMessage = `Backend conversion API returned an error (${response.status}): ${errorData.message || response.statusText}`;
        console.error(errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Removed raw text parsing, JSON.parse try/catch, reasons grouping, and setTimeout
      return result;

    } catch (error) {
      console.error("Error during PNG conversion API call:", error);
      throw error;
    }
  },

  img2jpg: async () => {
    try {
      const selectedData = await fetchSelectedFiles();
      const filesToConvert = selectedData.files;

      if (!filesToConvert || filesToConvert.length === 0) {
        return { totalConverted: 0, results: [], message: 'No files selected for conversion.', skipped: true };
      }

      const backendEndpoint = '/img-webp/convert-to-jpg';

      const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesToConvert }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        const errorMessage = `Backend conversion API returned an error (${response.status}): ${errorData.message || response.statusText}`;
        console.error(errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Removed raw text parsing, JSON.parse try/catch, reasons grouping, and setTimeout
      return result;

    } catch (error) {
      console.error("Error during JPG conversion API call:", error);
      throw error;
    }
  }
};

export default convertImages;
