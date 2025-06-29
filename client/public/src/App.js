// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments'; // This page handles both assignments and expenditures

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="flex flex-col min-h-screen bg-gray-100">
                    <Navbar />
                    <div className="flex flex-grow">
                        {/* Sidebar will only show if user is logged in (handled by Sidebar component itself) */}
                        <Sidebar />
                        <main className="flex-grow p-6">
                            <Routes>
                                <Route path="/login" element={<Login />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Base Commander', 'Logistics Officer']} />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Logistics Officer']} />}>
                                    <Route path="/purchases" element={<Purchases />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Logistics Officer', 'Base Commander']} />}>
                                    <Route path="/transfers" element={<Transfers />} />
                                    <Route path="/assignments" element={<Assignments />} />
                                </Route>

                                {/* Fallback for unmatched routes - redirect to login or dashboard */}
                                <Route path="/" element={<Login />} />
                                <Route path="*" element={<Login />} /> {/* Catch-all for undefined routes */}
                            </Routes>
                        </main>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
