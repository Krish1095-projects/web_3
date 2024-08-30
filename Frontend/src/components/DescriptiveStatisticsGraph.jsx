import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DescriptiveStatisticsGraphs = ({ jsonData }) => {
    if (!jsonData) return null;

    const missingValues = jsonData.missing_values;
    const labelDistribution = jsonData.label_distribution;

    // Prepare data for Missing Values Graph
    const missingValuesData = Object.keys(missingValues).map(key => ({
        variable: key,
        missingValues: missingValues[key],
    }));

    // Prepare data for Label Distribution Graph
    const labelDistributionData = Object.entries(labelDistribution).map(([key, value]) => ({
        label: `Label ${key}`,
        count: value,
    }));

    return (
        <div className="flex justify-between">
            {/* Missing Values Bar Chart */}
            <div className="w-1/2 pr-2">
                <h3 className="text-lg font-semibold mt-4">Missing Values</h3>
                <BarChart width={500} height={300} data={missingValuesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variable" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="missingValues" fill="#8884d8" />
                </BarChart>
            </div>

            {/* Label Distribution Bar Chart */}
            <div className="w-1/2 pl-2">
                <h3 className="text-lg font-semibold mt-4">Label Distribution</h3>
                <BarChart width={500} height={300} data={labelDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
            </div>
        </div>
    );
};

export default DescriptiveStatisticsGraphs;
