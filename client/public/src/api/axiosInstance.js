// client/src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // Adjust if your backend runs on a different port or path
    timeout: 5000, // 5 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token; // Get token from local storage if user exists

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration or invalidity
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Handle token expiration or unauthorized access
            console.error("Authentication error, redirecting to login...");
            localStorage.removeItem('user'); // Clear invalid user data
            // Optionally, redirect to login page (e.g., using window.location or history.push)
            window.location.href = '/login'; // Simple redirect
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
