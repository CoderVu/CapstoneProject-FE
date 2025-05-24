import axios from "axios";

const findSimilarImages = async (imageData) => {
  try {
    let response;
    
    // Check if imageData is FormData (file upload) or URL
    if (imageData instanceof FormData) {
      response = await axios.post('http://127.0.0.1:5000/api/find_similar', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else if (typeof imageData === 'string') {
      // If it's a URL string
      response = await axios.post('http://127.0.0.1:5000/api/find_similar', { url: imageData });
    } else {
      throw new Error('Invalid input: Expected FormData for file upload or string for URL');
    }

    return response.data;
  } catch (error) {
    console.error("Error finding similar images:", error);
    throw error;
  }
};

export default findSimilarImages;