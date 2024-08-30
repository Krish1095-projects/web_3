import React from 'react';
import Plot from 'react-plotly.js';

const SentimentAnalysisVisualization = ({ results }) => {
    const { polarity_histogram, subjectivity_histogram, vader_pie_chart, emotion_pie_chart } = results;

    return (
        <div className="grid grid-cols-2 gap-6 p-4">
            {/* Polarity Histogram */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Polarity Distribution</h3>
                <Plot
                    data={polarity_histogram.data} // Use the data for the histogram
                    layout={polarity_histogram.layout} // Use the layout from the response
                />
            </div>

            {/* Subjectivity Histogram */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-green-600 mb-2">Subjectivity Distribution</h3>
                <Plot
                    data={subjectivity_histogram.data} // Use the data for the histogram
                    layout={subjectivity_histogram.layout} // Use the layout from the response
                />
            </div>

            {/* VADER Sentiment Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-orange-600 mb-2">VADER Sentiment Distribution</h3>
                <Plot
                    data={vader_pie_chart.data} // Use the data for the pie chart
                    layout={vader_pie_chart.layout} // Use the layout from the response
                />
            </div>

            {/* Emotion Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-purple-600 mb-2">Emotion Distribution</h3>
                <Plot
                    data={emotion_pie_chart.data} // Use the data for the pie chart
                    layout={emotion_pie_chart.layout} // Use the layout from the response
                />
            </div>
        </div>
    );
};

export default SentimentAnalysisVisualization;
