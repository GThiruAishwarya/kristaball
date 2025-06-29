// client/src/pages/Purchases.jsx
import React from 'react';

const Purchases = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Purchases Management</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Record New Purchase</h2>
                {/* Purchase Form Fields */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assetType">Asset Type</label>
                        <select id="assetType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Vehicle</option>
                            <option>Small Arm</option>
                            <option>Ammunition</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modelName">Specific Asset Model/Name</label>
                        <input type="text" id="modelName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">Quantity</label>
                        <input type="number" id="quantity" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unitCost">Unit Cost (Optional)</label>
                        <input type="number" id="unitCost" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalCost">Total Cost (Calculated)</label>
                        <input type="text" id="totalCost" className="shadow appearance-none bg-gray-100 border rounded w-full py-2 px-3 text-gray-700" readOnly />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purchaseDate">Purchase Date</label>
                        <input type="date" id="purchaseDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplierInfo">Supplier Information</label>
                        <input type="text" id="supplierInfo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receivingBase">Receiving Base</label>
                        <select id="receivingBase" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Base Alpha</option>
                            <option>Base Bravo</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">Notes/Remarks</label>
                        <textarea id="notes" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Record Purchase
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Historical Purchases</h2>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="historyDateRange">Date Range</label>
                        <select id="historyDateRange" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>All Time</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="historyEquipmentType">Equipment Type</label>
                        <select id="historyEquipmentType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>All Types</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="historyReceivingBase">Receiving Base</label>
                        <select id="historyReceivingBase" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>All Bases</option>
                        </select>
                    </div>
                </div>

                {/* Table of Historical Purchases */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left text-gray-600">Asset Type</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Model</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Total Cost</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Purchase Date</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Supplier</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Receiving Base</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example Row (will be dynamic) */}
                            <tr>
                                <td className="py-2 px-4 border-b">Vehicle</td>
                                <td className="py-2 px-4 border-b">Humvee M1151</td>
                                <td className="py-2 px-4 border-b">5</td>
                                <td className="py-2 px-4 border-b">$250,000</td>
                                <td className="py-2 px-4 border-b">2023-01-15</td>
                                <td className="py-2 px-4 border-b">Defense Corp</td>
                                <td className="py-2 px-4 border-b">Base Alpha</td>
                            </tr>
                            {/* More rows */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchases;
