// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTachometerAlt, FaShoppingCart, FaExchangeAlt, FaUserTag, FaUsers, FaWarehouse, FaCogs } from 'react-icons/fa'; // Example icons

const Sidebar = () => {
    const { user, hasRole } = useAuth();

    if (!user) return null; // Don't show sidebar if not logged in

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-lg">
            <div className="py-6 px-4 text-center text-xl font-semibold border-b border-gray-700">
                Menu
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2 p-4">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                }`
                            }
                        >
                            <FaTachometerAlt className="mr-3" /> Dashboard
                        </NavLink>
                    </li>
                    {hasRole(['Admin', 'Logistics Officer']) && (
                        <li>
                            <NavLink
                                to="/purchases"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaShoppingCart className="mr-3" /> Purchases
                            </NavLink>
                        </li>
                    )}
                    {hasRole(['Admin', 'Logistics Officer', 'Base Commander']) && (
                        <li>
                            <NavLink
                                to="/transfers"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaExchangeAlt className="mr-3" /> Transfers
                            </NavLink>
                        </li>
                    )}
                    {hasRole(['Admin', 'Logistics Officer', 'Base Commander']) && (
                        <li>
                            <NavLink
                                to="/assignments"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaUserTag className="mr-3" /> Assignments & Expenditures
                            </NavLink>
                        </li>
                    )}
                    {/* Additional Admin-only or specific role links */}
                    {hasRole(['Admin']) && (
                        <li>
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaUsers className="mr-3" /> User Management
                            </NavLink>
                        </li>
                    )}
                     {hasRole(['Admin']) && (
                        <li>
                            <NavLink
                                to="/assets-master"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaWarehouse className="mr-3" /> Asset Master
                            </NavLink>
                        </li>
                    )}
                    {hasRole(['Admin']) && (
                        <li>
                            <NavLink
                                to="/settings"
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200 ${
                                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaCogs className="mr-3" /> Settings
                            </NavLink>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
