import { PLUGIN_ID } from '../pluginId';

const autoConvertImages = {
  toggle: async (enabled) => {
    try {
      const response = await fetch(`/${PLUGIN_ID}/set-auto-convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating auto-convert settings:", error);
      throw error;
    }
  },

  getStatus: async () => {
    try {
      const response = await fetch(`/${PLUGIN_ID}/get-auto-convert`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.enabled;
    } catch (error) {
      console.error("Error fetching auto-convert settings:", error);
      return false;
    }
  }
};

export default autoConvertImages;
