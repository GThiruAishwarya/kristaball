// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner component
    }

    if (!user) {
        // User not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        // User logged in but doesn't have the required role, redirect to unauthorized page or dashboard
        return <Navigate to="/dashboard" replace />; // Or /unauthorized
    }

    // User is logged in and has the required role (if specified), render the child routes/components
    return <Outlet />;
};

export default ProtectedRoute;
