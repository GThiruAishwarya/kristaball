// client/src/pages/Assignments.jsx
import React from 'react';

const Assignments = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Assets Assignments & Expenditures</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Assign Asset to Personnel</h2>
                {/* Assignment Form Fields */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignAssetType">Asset Type/Equipment Type</label>
                        <select id="assignAssetType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Small Arm</option>
                            <option>Vehicle</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignAssetID">Specific Asset ID (e.g., serial number)</label>
                        <input type="text" id="assignAssetID" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="personnelID">Personnel ID/Name</label>
                        <input type="text" id="personnelID" placeholder="Search personnel..." className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignmentDate">Assignment Date</label>
                        <input type="date" id="assignmentDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="baseOfAssignment">Base of Assignment</label>
                        <select id="baseOfAssignment" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Base Alpha</option>
                            <option>Base Bravo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purpose">Purpose of Assignment</label>
                        <input type="text" id="purpose" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expectedReturnDate">Expected Return Date (Optional)</label>
                        <input type="date" id="expectedReturnDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Assign Asset
                        </button>
                    </div>
                </form>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Track Expended Assets</h2>
                {/* Expenditure Form Fields */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expenditureAssetType">Asset Type/Equipment Type</label>
                        <select id="expenditureAssetType" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Ammunition</option>
                            <option>Rations</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantityExpended">Quantity Expended</label>
                        <input type="number" id="quantityExpended" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfExpenditure">Date of Expenditure</label>
                        <input type="date" id="dateOfExpenditure" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="baseWhereExpended">Base Where Expenditure Occurred</label>
                        <select id="baseWhereExpended" className="shadow border rounded w-full py-2 px-3 text-gray-700">
                            <option>Base Alpha</option>
                            <option>Base Bravo</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expenditureReason">Reason for Expenditure</label>
                        <textarea id="expenditureReason" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reportingPersonnel">Reporting Personnel ID/Name</label>
                        <input type="text" id="reportingPersonnel" placeholder="Search personnel..." className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Record Expenditure
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Current Assignments & Expenditure History</h2>
                {/* Table for current assignments */}
                <h3 className="text-xl font-semibold mb-2 text-gray-600">Current Assignments</h3>
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left text-gray-600">Asset ID</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Asset Type</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Assigned To</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Assignment Date</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Purpose</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Base</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example Row (will be dynamic) */}
                            <tr>
                                <td className="py-2 px-4 border-b">ASST-005</td>
                                <td className="py-2 px-4 border-b">Small Arm</td>
                                <td className="py-2 px-4 border-b">John Doe</td>
                                <td className="py-2 px-4 border-b">2024-05-10</td>
                                <td className="py-2 px-4 border-b">Training</td>
                                <td className="py-2 px-4 border-b">Base Alpha</td>
                                <td className="py-2 px-4 border-b">
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded">Return</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-gray-600">Expenditure History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left text-gray-600">Exp. ID</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Asset Type</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Base</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Reason</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Reported By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example Row (will be dynamic) */}
                            <tr>
                                <td className="py-2 px-4 border-b">EXP-010</td>
                                <td className="py-2 px-4 border-b">Ammunition (5.56mm)</td>
                                <td className="py-2 px-4 border-b">500</td>
                                <td className="py-2 px-4 border-b">2024-05-12</td>
                                <td className="py-2 px-4 border-b">Base Alpha</td>
                                <td className="py-2 px-4 border-b">Training Exercise</td>
                                <td className="py-2 px-4 border-b">Jane Doe</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Assignments;
