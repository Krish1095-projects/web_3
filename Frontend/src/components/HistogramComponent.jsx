import React from 'react';
import Plot from 'react-plotly.js';

const HistogramComponent = ({ results }) => {
    // Destructure the figures from results
    const {
        character_count_fig,
        sentence_length_fig,
        word_count_fig,
        time_series_fig
    } = results;

    // Parse the figures from JSON format safely
    const parseFigure = (fig) => {
        try {
            return JSON.parse(fig);
        } catch (error) {
            console.error("Error parsing figure:", error);
            return { data: [], layout: {} }; // Return empty if parsing fails
        }
    };

    const characterCountFig = parseFigure(character_count_fig);
    const sentenceLengthFig = parseFigure(sentence_length_fig);
    const wordCountFig = parseFigure(word_count_fig);
    const timeSeriesFig = parseFigure(time_series_fig);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Character Count Histogram */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Character Count Distribution</h3>
                <Plot
                    data={characterCountFig.data}
                    layout={characterCountFig.layout}
                />
            </div>

            {/* Sentence Length Histogram */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-green-600 mb-2">Sentence Length Distribution</h3>
                <Plot
                    data={sentenceLengthFig.data}
                    layout={sentenceLengthFig.layout}
                />
            </div>

            {/* Word Count Histogram */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-orange-600 mb-2">Word Count Distribution</h3>
                <Plot
                    data={wordCountFig.data}
                    layout={wordCountFig.layout}
                />
            </div>

            {/* Time Series Plot */}
            {time_series_fig && (
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">Time Series Data</h3>
                    <Plot
                        data={timeSeriesFig.data}
                        layout={timeSeriesFig.layout}
                    />
                </div>
            )}
        </div>
    );
};

export default HistogramComponent;
