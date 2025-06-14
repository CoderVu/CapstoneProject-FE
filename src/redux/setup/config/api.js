// API Configuration
const API_CONFIG = {
 // BASE_URL: 'https://capstoneproject-be-iapt.onrender.com/api',
  BASE_URL: 'http://20.3.131.196:5000/api',
  
  // AI Endpoints
  AI: {
    FIND_SIMILAR: '/find_similar',
    EXTRACTION: {
      STATS: '/extraction/stats',
      STATUS: '/extraction/status',
      PRODUCTS: '/extraction/products',
      START: '/extraction/start',
      STOP: '/extraction/stop',
      PROCESS_NEW: '/extraction/process_new',
      UPDATE_SINGLE: '/extraction/update_single'
    }
  }
};

export default API_CONFIG; 