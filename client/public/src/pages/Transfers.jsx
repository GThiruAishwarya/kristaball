// client/src/pages/Transfers.jsx
import React from 'react';

const Transfers = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Asset Transfers</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Initiate New Transfer</h2>
                {/* Transfer Form Fields */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transferAssetType">Asset Type/Equipment Type</label>
                        <select id="transferAssetType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Vehicle</option>
                            <option>Ammunition</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assetID">Specific Asset ID(s) / Quantity</label>
                        <input type="text" id="assetID" placeholder="e.g., SN12345 or 100 rounds" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sourceBase">Source Base</label>
                        <select id="sourceBase" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Base Alpha</option>
                            <option>Base Bravo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destinationBase">Destination Base</label>
                        <select id="destinationBase" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Base Bravo</option>
                            <option>Base Charlie</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transferDate">Transfer Date</label>
                        <input type="date" id="transferDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">Reason for Transfer</label>
                        <input type="text" id="reason" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">Notes/Remarks</label>
                        <textarea id="notes" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Initiate Transfer
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Transfer History</h2>
                {/* Table of Transfer History */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left text-gray-600">Transfer ID</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Asset Details</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Source Base</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Destination Base</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example Row (will be dynamic) */}
                            <tr>
                                <td className="py-2 px-4 border-b">TRF-001</td>
                                <td className="py-2 px-4 border-b">Humvee M1151 (SN12345)</td>
                                <td className="py-2 px-4 border-b">1</td>
                                <td className="py-2 px-4 border-b">Base Alpha</td>
                                <td className="py-2 px-4 border-b">Base Bravo</td>
                                <td className="py-2 px-4 border-b">2023-02-01</td>
                                <td className="py-2 px-4 border-b text-yellow-600">Pending</td>
                            </tr>
                            {/* More rows */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
