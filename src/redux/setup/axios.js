import axios from "axios";

const instance = axios.create({
    baseURL: 'http://192.168.1.3:8080',
    withCredentials: true, 
});

// Thêm interceptor cho request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token"); 
    if (token) {
        config.headers.Authorization = `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6ImNsb3RoZXMifQ.eyJwaG9uZSI6IjA3NjM3NjQ5MTUiLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiaWF0IjoxNzM3OTUzNzkzLCJleHAiOjE3MzgwNDAxOTMsImlzcyI6IlNob3BTeXN0ZW0iLCJhdWQiOiJTaG9wU3lzdGVtIiwibmJmIjoxNzM3OTUzNzkzLCJqdGkiOiJmMjgxMzdjOS1lNDA4LTQzYTktOTMzMy01OGM1M2ZiOTkyYjYifQ.K5K2FIEcU_01R0YVACDpw2G3fxNhR5aVsV6zK0pssCFd5PfHmUI2mTL1biRpDgEcFKq77VLJBvESsT78Z8Q-Bw`; 
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
