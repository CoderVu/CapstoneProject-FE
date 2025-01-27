import axios from "../setup/axios"; 

const fetchAllProducts = async (page = 0, size = 10) => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/products',
            params: { page, size }, // Thêm query parameters cho phân trang
        });

        // Trích xuất dữ liệu cần thiết từ response
        const { data } = response.data;
        console.log("fetchAllProducts -> data", data);

        return data; // Trả về phần data cho dễ sử dụng
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error; // Ném lỗi ra để các tầng trên xử lý
    }
};

export {
    fetchAllProducts
};
