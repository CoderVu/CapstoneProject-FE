import axios from "axios";
import API_CONFIG from "./config/api";

const findSimilarImages = async (imageData) => {
  try {
    let response;
    
    // Check if imageData is FormData (file upload) or URL
    if (imageData instanceof FormData) {
      response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.FIND_SIMILAR}`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else if (typeof imageData === 'string') {
      // If it's a URL string
      response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AI.FIND_SIMILAR}`, { url: imageData });
    } else {
      throw new Error('Invalid input: Expected FormData for file upload or string for URL');
    }

    console.log("Response from findSimilarImages:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error finding similar images:", error);
    throw error;
  }
};

export default findSimilarImages;