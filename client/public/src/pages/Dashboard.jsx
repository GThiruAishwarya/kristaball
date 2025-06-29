// client/src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth(); // Get user details if needed for personalized dashboard

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
            <p className="text-lg text-gray-700 mb-4">
                Welcome to the Military Asset Management System.
            </p>
            {user && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
                    <p>Logged in as: <span className="font-semibold">{user.full_name || user.username}</span></p>
                    <p>Your roles: <span className="font-semibold">{user.roles?.join(', ')}</span></p>
                    {user.base_ids && user.base_ids.length > 0 && (
                        <p>Your assigned base IDs: <span className="font-semibold">{user.base_ids.join(', ')}</span></p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Placeholder for Key Metrics Display */}
                <div className="bg-green-100 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Opening Balance</h3>
                    <p className="text-3xl font-bold text-green-900">XXXX</p>
                    {/* Add actual data fetching here */}
                </div>
                <div className="bg-yellow-100 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">Closing Balance</h3>
                    <p className="text-3xl font-bold text-yellow-900">XXXX</p>
                </div>
                <div className="bg-purple-100 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-purple-800 mb-2">Net Movement</h3>
                    <p className="text-3xl font-bold text-purple-900">XXXX</p>
                    {/* Bonus Feature: Pop-up display on click */}
                </div>
                <div className="bg-red-100 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-red-800 mb-2">Assigned Assets</h3>
                    <p className="text-3xl font-bold text-red-900">XXXX</p>
                </div>
                <div className="bg-blue-100 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Expended Assets</h3>
                    <p className="text-3xl font-bold text-blue-900">XXXX</p>
                </div>
            </div>

            {/* Filters will go here */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Filters</h3>
                {/* Date Range, Base, Equipment Type filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateRange">
                            Date Range
                        </label>
                        <select id="dateRange" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Custom</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base">
                            Base
                        </label>
                        <select id="base" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>All Bases</option>
                            {/* Dynamically load bases */}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="equipmentType">
                            Equipment Type
                        </label>
                        <select id="equipmentType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>All Types</option>
                            {/* Dynamically load equipment types */}
                        </select>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
