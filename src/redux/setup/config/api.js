// API Configuration
const API_CONFIG = {
  // BASE_URL: 'https://capstoneproject-be-iapt.onrender.com/api',
  BASE_URL: 'https://www.capstone.io.vn/ai',
  // BASE_URL: 'http://127.0.0.1:5000',

  // AI Endpoints
  AI: {
    EXTRACTION: {
      STATS: '/api/extraction/stats',
      STATUS: '/api/extraction/status',
      START: '/api/extraction/start',
      STOP: '/api/extraction/stop',
      PRODUCTS: '/api/extraction/products',
      UPDATE_SINGLE: '/api/extraction/update_single',
      PROCESS_NEW: '/api/extraction/process_new',
      UPDATE_ALL: '/api/extraction/update_all',
      CONFIG: '/api/extraction/config',
      CLEAR_CACHE: '/api/extraction/clear_cache',
      PRODUCT_IMAGES: '/api/extraction/product_images',
      DETAILS: '/api/extraction/details',
      ADVANCED_CONFIG: '/api/extraction/advanced_config'
    },

    FIND_SIMILAR: '/api/find_similar'
  }
};


export default API_CONFIG; 