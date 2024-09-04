import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const KeywordExtractionVisualization = ({ results, onTopNChange }) => {
    const { tfidf_figures, word2vec_figure } = results;
    const [topN, setTopN] = useState(5); // Default value for top_n

    const handleInputChange = (event) => {
        const value = event.target.value;
        // Update the state with the new top_n value
        if (value && !isNaN(value)) {
            setTopN(Number(value)); // Convert to number and set state
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Submitting topN:", topN);
        if (onTopNChange && (topN !== results.topN)) { // Only call if topN is different
            onTopNChange(topN);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Keyword Extraction Visualization</h2>

            {/* Input for top_n */}
            <form onSubmit={handleSubmit} className="mb-4">
                <label className="block mb-2 text-gray-700" htmlFor="topNInput">
                    Enter Top N Keywords:
                </label>
                <input
                    type="number"
                    id="topNInput"
                    value={topN}
                    onChange={handleInputChange}
                    min="1"
                    className="border rounded-md p-2"
                />
                <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-md">
                    Update
                </button>
            </form>

            <div className="flex justify-between">
                {/* TF-IDF Bar Graph */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 w-1/2">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">TF-IDF Keyword Extraction</h3>
                    <Plot
                        data={tfidf_figures.data} // Use the data for the histogram
                        layout={tfidf_figures.layout} // Use the layout from the response
                    />
                </div>

                {/* Word2Vec Word Cloud */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 w-1/2">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">Word2Vec Word Cloud</h3>
                    <Plot
                        data={word2vec_figure.data} // Use the data for the word cloud
                        layout={word2vec_figure.layout} // Use the layout from the response
                    />
                </div>
            </div>
        </div>
    );
};

export default KeywordExtractionVisualization;
