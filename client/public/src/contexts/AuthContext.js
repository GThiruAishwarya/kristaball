// client/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Use the configured axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user on initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user from localStorage:", e);
                localStorage.removeItem('user'); // Clear bad data
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { username, password });
            const { user, token } = response.data; // Assuming your backend returns user data and token

            // Store user info and token in local storage
            localStorage.setItem('user', JSON.stringify({ ...user, token }));
            setUser({ ...user, token });
            return response.data;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error; // Re-throw to be handled by the component
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login'; // Redirect to login page on logout
    };

    // Helper to check user roles
    const hasRole = (roles) => {
        if (!user || !user.roles) return false;
        return user.roles.some(role => roles.includes(role));
    };

    // Helper to check user bases
    const hasBaseAccess = (baseId) => {
        if (!user || !user.base_ids) return false;
        if (user.roles.includes('Admin')) return true; // Admin has access to all bases
        return user.base_ids.includes(baseId);
    };


    const authContextValue = {
        user,
        loading,
        login,
        logout,
        hasRole,
        hasBaseAccess,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children} {/* Render children only after loading initial user state */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
