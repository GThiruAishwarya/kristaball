// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-white text-2xl font-bold">
                    KristalBall AMS
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-gray-300">Welcome, {user.full_name || user.username} ({user.roles?.join(', ')})</span>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="text-white hover:text-gray-300">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
