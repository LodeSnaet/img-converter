// admin/src/api/convert.js
import axios from 'axios';

const convertApi = {
  getConvert: async () => {
    try {
      const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');

      console.log('Making API request to /admin/plugins/img-webp/files');

      const response = await axios.get(`${process.env.STRAPI_ADMIN_BACKEND_URL}/plugins/img-webp/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`${process.env.STRAPI_ADMIN_BACKEND_URL}/plugins/img-webp/files`);

      console.log('Full API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.warn('Unexpected data structure:', response.data);
        throw new Error('Invalid data structure received');
      }

      console.log('Processed image files:', response.data.data);
      return response.data;

    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      throw error;
    }
  },
};

export default convertApi;
