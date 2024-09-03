import React from 'react';
import Plot from 'react-plotly.js';

const WordCloudVisualization = ({ wordcloudPlots = [] }) => {
    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Word Cloud Visualizations</h2>
            <div className="flex flex-wrap justify-center">
                {wordcloudPlots.length > 0 ? (
                    wordcloudPlots.map((plotJson, index) => {
                        // Parse the JSON string for each plot
                        const plot = JSON.parse(plotJson); // Ensure this JSON is valid

                        return (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4 m-2 w-1/2">
                                <Plot
                                    data={plot.data}  // Use the parsed data
                                    layout={plot.layout} // Use the parsed layout
                                />
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-600">No word clouds to display.</p>
                )}
            </div>
        </div>
    );
};

export default WordCloudVisualization;
