import React from 'react';
import Plot from 'react-plotly.js';

const NGramVisualization = ({ plots }) => {
    const parseFigure = (fig) => {
        try {
            return JSON.parse(fig);
        } catch (error) {
            console.error("Error parsing figure:", error);
            return { data: [], layout: {} }; // Return empty if parsing fails
        }
    };

    const plotKeys = Object.keys(plots);
    
    return (
        <div className="grid grid-cols-2 gap-6 p-4"> {/* 2 columns with gap */}
            {plotKeys.map((key) => {
                const parsedPlot = parseFigure(plots[key]);
                return (
                    <div key={key} className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold text-blue-600 mb-2">
                            {`${key.replace('-', ' ')} Plot`} {/* Plot title */}
                        </h3>
                        <Plot
                            data={parsedPlot.data}
                            layout={parsedPlot.layout}
                            config={{ responsive: true }} // Make plot responsive
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default NGramVisualization;
