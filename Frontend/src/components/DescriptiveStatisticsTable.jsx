import React from 'react';

const DescriptiveStatisticsTables = ({ jsonData }) => {
    if (!jsonData) return null;

    const dataTypes = jsonData.data_types;
    const missingValues = jsonData.missing_values;
    const labelDistribution = jsonData.label_distribution;
    const totalEntries = jsonData.total_entries.total_entries;

    // Table for Data Types
    const dataTypeHeaders = ['Variable', 'Data Type'];
    const dataTypeTableData = Object.keys(dataTypes).map(key => ({
        variable: key,
        dataType: dataTypes[key],
    }));

    // Table for Missing Values
    const missingValueHeaders = ['Variable', 'Missing Values'];
    const missingValueTableData = Object.keys(missingValues).map(key => ({
        variable: key,
        missingValues: missingValues[key],
    }));

    // Table for Label Distribution
    const labelDistributionHeaders = ['Label', 'Count'];
    const labelDistributionTableData = Object.entries(labelDistribution).map(([key, value]) => ({
        label: `Label ${key}`,
        count: value,
    }));

    return (
        <div>
            {/* Data Types Table */}
            <h3 className="text-lg font-semibold mt-4">Data Types</h3>
            <table className="min-w-full border-collapse border border-gray-300 mb-4">
                <thead>
                    <tr>
                        {dataTypeHeaders.map((header, index) => (
                            <th key={index} className="border border-gray-300 p-2">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataTypeTableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="border border-gray-300 p-2">{row.variable}</td>
                            <td className="border border-gray-300 p-2">{row.dataType}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Missing Values Table */}
            <h3 className="text-lg font-semibold mt-4">Missing Values</h3>
            <table className="min-w-full border-collapse border border-gray-300 mb-4">
                <thead>
                    <tr>
                        {missingValueHeaders.map((header, index) => (
                            <th key={index} className="border border-gray-300 p-2">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {missingValueTableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="border border-gray-300 p-2">{row.variable}</td>
                            <td className="border border-gray-300 p-2">{row.missingValues}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Label Distribution Table */}
            <h3 className="text-lg font-semibold mt-4">Label Distribution</h3>
            <table className="min-w-full border-collapse border border-gray-300 mb-4">
                <thead>
                    <tr>
                        {labelDistributionHeaders.map((header, index) => (
                            <th key={index} className="border border-gray-300 p-2">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {labelDistributionTableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="border border-gray-300 p-2">{row.label}</td>
                            <td className="border border-gray-300 p-2">{row.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total Entries Row */}
            <h3 className="text-lg font-semibold mt-4">Total Entries</h3>
            <div className="border border-gray-300 p-2">Total Entries: {totalEntries}</div>
        </div>
    );
};

export default DescriptiveStatisticsTables;
