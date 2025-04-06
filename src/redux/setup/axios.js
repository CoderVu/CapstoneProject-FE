import axios from "axios";

const instance = axios.create({
    baseURL: 'http://192.168.1.39:8080',
    withCredentials: true, 
});

// Thêm interceptor cho request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token"); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Interceptor cho response
instance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default instance;
