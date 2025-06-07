import axios from "axios";

/**
 * Finds similar images using the AI API
 * @param {FormData|string} imageData - Either FormData for file upload or string URL
 * @returns {Promise<Array<{index: number, similarity: number, url: string}>>} Array of similar image results
 */
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

    // Validate response data structure
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response: Expected array of results');
    }

    // Validate and transform each result
    const validatedResults = response.data.map((result, idx) => {
      // Ensure required fields exist
      if (typeof result.similarity !== 'number' || !result.url) {
        console.warn(`Invalid result at index ${idx}:`, result);
        return null;
      }

      return {
        index: result.index ?? idx, // Use provided index or fallback to array index
        similarity: Number(result.similarity), // Ensure similarity is a number
        url: String(result.url) // Ensure url is a string
      };
    }).filter(Boolean); // Remove any invalid results

    console.log("Processed similar images results:", validatedResults);
    return validatedResults;

  } catch (error) {
    console.error("Error finding similar images:", error);
    throw error;
  }
};

export default findSimilarImages; 