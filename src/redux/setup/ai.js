import axios from "axios";

const findSimilarImages = async (imageUrl) => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/find_similar', { url: imageUrl });
    return response.data; // Assuming the API returns the data in the response body
  } catch (error) {
    console.error("Error finding similar images:", error);
    throw error;
  }
};

export default findSimilarImages;