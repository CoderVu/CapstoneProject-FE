// API Configuration
const API_CONFIG = {
  // BASE_URL: 'https://capstoneproject-be-iapt.onrender.com/api',
   BASE_URL: 'https://www.capstone.io.vn/ai',
 //  BASE_URL: 'http://127.0.0.1:5000',


   AI: {
    EXTRACTION: {
      STATS: '/api/extraction/stats',
      STATUS: '/api/extraction/status',
      START: '/api/extraction/start',
      STOP: '/api/extraction/stop',
      PRODUCTS: '/api/extraction/products',
      UPDATE_ALL: '/api/extraction/update_all',
      UPDATE_SINGLE: '/api/extraction/update_single',
      PROCESS_NEW: '/api/extraction/process_new',
      CLEAR_CACHE: '/api/extraction/clear_cache',
      CONFIG: '/api/extraction/config',
      VECTOR_DIMENSIONS: '/api/extraction/vector_dimensions',
      FIX_DIMENSIONS: '/api/extraction/fix_dimensions'
    },
    
    FIND_SIMILAR: '/api/find_similar'
  }
};

export default API_CONFIG; 