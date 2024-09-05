import React from 'react';
import Plot from 'react-plotly.js';

const PredictiveAnalysisVisualization = ({ performance_results }) => {
    const {text_length_distribution, confusion_matrix_plot, performance_metrics_plot,roc_curve_plot } = performance_results;

    // Parse the figures from JSON format safely
    const parseFigure = (fig) => {
        try {
            return JSON.parse(fig);
        } catch (error) {
            console.error("Error parsing figure:", error);
            return { data: [], layout: {} }; // Return empty if parsing fails
        }
    };
    const Miss_distributionFig = parseFigure(text_length_distribution);
    const ConfusionMatrixFig = parseFigure(confusion_matrix_plot);
    const PerformanceFig = parseFigure(performance_metrics_plot);
    const ROCAUCFig = parseFigure(roc_curve_plot);

    return (
        <div className="grid grid-cols-2 gap-6 p-4">
            {/* text_length_distribution */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-green-600 mb-2">Misclassification analysis</h3>
                <Plot
                    data={Miss_distributionFig.data} // Use the data for the histogram
                    layout={Miss_distributionFig.layout} // Use the layout from the response
                />
            </div>

            {/* confusion_matrix_plot */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-orange-600 mb-2">Confusion matrix</h3>
                <Plot
                    data={ConfusionMatrixFig.data} // Use the data for the pie chart
                    layout={ConfusionMatrixFig.layout} // Use the layout from the response
                />
            </div>

            {/* performance_metrics_plot*/}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-purple-600 mb-2">Classification Performance Metrics</h3>
                <Plot
                    data={PerformanceFig.data} // Use the data for the pie chart
                    layout={PerformanceFig.layout} // Use the layout from the response
                />
            </div>
            {/* ROCAUCFig_plot*/}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-purple-600 mb-2">ROC_AUC Plot</h3>
                <Plot
                    data={ROCAUCFig.data} // Use the data for the pie chart
                    layout={ROCAUCFig.layout} // Use the layout from the response
                />
            </div>
        </div>
    );
};

export default PredictiveAnalysisVisualization;
