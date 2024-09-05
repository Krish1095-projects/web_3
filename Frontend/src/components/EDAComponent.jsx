import React, { useState } from 'react';
import { useFileContext } from '../context/FileContext';
import axios from 'axios';
import HeaderComponent from "./Header";
import { MenuAlt1Icon, XIcon } from '@heroicons/react/outline';
import DescriptiveStatisticsTable from './DescriptiveStatisticsTable';
import DescriptiveStatisticsGraph from './DescriptiveStatisticsGraph';
import TopicModelingVisualization from './TopicModelingVisualization'; // Adjust the path as needed
import SentimentAnalysisVisualization from './SentimentAnalysisVisualization';
import KeywordExtractionVisualization from './KeywordExtractionVisualization';
import WordCloudVisualization from './WordCloudVisualization';
import HistogramComponent from './HistogramComponent';
import NGramVisualization from './NGramVisualization';
import PredictiveAnalysisVisualization from './PredictiveAnalysis';

const EDADashboard = () => {
    const { filename } = useFileContext(); // Get the filename from context
    const [isPanelOpen, setIsPanelOpen] = useState(true); // State to manage panel visibility
    const [showTextAnalysisSubMenu, setShowTextAnalysisSubMenu] = useState(false);
    const [showDataDistributionSubMenu, setShowDataDistributionSubMenu] = useState(false);
    const [content, setContent] = useState(null); // State to manage right panel content
    const [numTopics] = useState(25);
    const [loading, setLoading] = useState(false); // State to manage loading
    const [topN, setTopN] = useState(); // State for top_n
    const [n_gram] = useState([1,6]); // State for top_n

    const togglePanel = () => {
        setIsPanelOpen(prevState => !prevState); // Toggle panel visibility
    };

    const toggleTextAnalysisSubMenu = () => {
        setShowTextAnalysisSubMenu(prevState => !prevState);
    };

    const toggleDataDistributionSubMenu = () => {
        setShowDataDistributionSubMenu(prevState => !prevState);
    };

    const handleTopNChange = async (newTopN) => {
        setLoading(true)
        try {
            console.log("New topN value received:", newTopN); 
            setTopN(newTopN);
            const response = await axios.post('http://localhost:5000/keyword_extraction', { top_n: newTopN, filename });
            setContent(
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <KeywordExtractionVisualization results={response.data} />
                </div>
            );
        } catch (error) {
            console.error('Error fetching updated keyword extraction results:', error);
        }finally{
            setLoading(false); // Stop loading
        }
    };

    const handleDescriptiveStats = async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
            
        }
        setLoading(true); // Start loading

        try {
            const response = await fetch("http://localhost:5000/des_stats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename }),
            });

            if (response.ok) {
                const results = await response.json();
                // Set the content to include the table and graph components
                setContent(
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Descriptive Statistics Results
                    </h3>
                    <DescriptiveStatisticsTable jsonData={results} />
                    <DescriptiveStatisticsGraph jsonData={results} />
                </div>
            );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching descriptive statistics:", error);
        }
        finally {
            setLoading(false); // Stop loading
        }
    };

    const handleInfo = () => {
        setLoading(true); // Start loading
        try{
        setContent(
            <div>
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Important Note
                    </h3>
                    <p className="text-black leading-relaxed mb-2">
                        This application is a prototype designed to explore and predict test samples related to COVID-19 tweets and news.
                    </p>
                <ul className="list-disc list-inside pl-4 text-gray-700">
                    <li className="mb-2">Do not use a dataset with more than 200 samples.</li>
                    <li className="mb-2">Ensure the feature names match the keywords provided below.</li>
                    <li className="mb-2">
                    For text features, accepted names are: 'tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text'.
                    </li>
                    <li className="mb-2">
                    For label features, accepted names are: 'label', 'target', 'Target', 'Label', 'class', 'Class'.
                    </li>
                </ul>
                </div>

                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Descriptive Statistics
                    </h3>
                    <p className="text-black leading-relaxed mb-2">
                        Explore with your datasets directly. It offers basic yet essential descriptions about your datasets.
                    </p>
                    <ul className="list-disc list-inside pl-4 text-gray-700">
                        <li className="mb-2">Summary Statistics of your data with built-in functions.</li>
                        <li className="mb-2">Identify the data types of each column (e.g., numerical, categorical, datetime) to understand how to handle the data appropriately.</li>
                        <li className="mb-2">Check for missing values in your dataset. Knowing where data is missing can help in deciding how to handle it</li>
                    </ul>
                </div>
                {/* Include other sections similar to Descriptive Statistics */}
                {/* Text Analysis */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Text Analysis
                    </h3>
                    <p className="text-black leading-relaxed mb-2">
                        Dive deep into textual data to uncover hidden insights. Our text analysis tools enable users to perform tasks like topic modeling, sentiment analysis, and keyword extraction. Understand trends and sentiments expressed in tweets or any textual data you work with.
                    </p>
                    <ul className="list-disc list-inside pl-4 text-gray-700">
                        <li className="mb-2">Identify prevalent topics within your text data.</li>
                        <li className="mb-2">Measure sentiment to gauge public opinion.</li>
                        <li className="mb-2">Extract keywords that best represent the content.</li>
                    </ul>
                </div>
                {/* Data Distribution */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Data Distribution
                    </h3>
                    <p className="text-black leading-relaxed mb-2">
                        Analyze how your data is distributed. Understanding the distribution of your data is key to making informed decisions in analysis and modeling.
                    </p>
                    <ul className="list-disc list-inside pl-4 text-gray-700">
                        <li className="mb-2">Visualize data distributions through histograms and density plots.</li>
                        <li className="mb-2">Understand frequency distributions to identify trends.</li>
                        <li className="mb-2">Perform N-gram analysis for deeper text understanding.</li>
                    </ul>
                </div>
                {/* Predictive Analysis */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-600 flex items-center">
                        Predictive Analysis
                    </h3>
                    <p className="text-black leading-relaxed mb-2">
                        Leverage historical data to forecast future trends. Apply our CA-BERT model to predict outcomes based on your data.
                    </p>
                    <ul className="list-disc list-inside pl-4 text-gray-700">
                        <li className="mb-2">Evaluate model performance and tune parameters.</li>
                        <li className="mb-2">Visualize predictions against actual data for validation.</li>
                    </ul>
                </div>
            </div>
        );
    }catch (error) {
        console.error("Error fetching data:", error);

    }finally{
        setLoading(false); // Start loading
    }

    };

    const handleTopicModeling = async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
        try {
            const response = await fetch("http://localhost:5000/topic_modeling", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename, num_topics: numTopics }), // Ensure this is a valid JSON string
            });
    
            if (response.ok) {
                const results = await response.json(); // Expecting JSON response
                
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-red-600 flex items-center">
                            Topic modeling results
                        </h3>
                        <TopicModelingVisualization visualizationData={results.html_content} />
                        
                    </div>
                );
            } else {
                const errorData = await response.text(); // Get raw response text
                console.error("Error response:", errorData); // Log the error response
                alert(`Error: ${errorData}`); // Show the raw error response
            }
        } catch (error) {
            console.error("Error fetching topic modeling results:", error);
            alert("There was an error fetching topic modeling results.");
        }finally {
            setLoading(false); // Stop loading
        }

    };

    const handleSentimentAnalysis = async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading

        try {
            const response = await fetch("http://localhost:5000/sentiment_analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename }),
            });

            if (response.ok) {
                const results = await response.json();
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-red-600 flex items-center">
                            Sentiment Analysis Results
                        </h3>
                        <SentimentAnalysisVisualization results={results} />
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching sentiment analysis results:", error);
        }
        finally {
            setLoading(false); // Stop loading
        }
    };

    const handlekeyword_extraction = async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
    
        try {
            const response = await fetch("http://localhost:5000/keyword_extraction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename, top_n: topN }),
            });
    
            if (response.ok) {
                const results = await response.json();
    
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <KeywordExtractionVisualization results={results} onTopNChange={handleTopNChange} />    
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching keyword_extraction results:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handlewordclouds= async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
    
        try {
            const response = await fetch("http://localhost:5000/wordclouds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({filename}),
            });
    
            if (response.ok) {
                const results = await response.json();
    
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <WordCloudVisualization wordcloudPlots={results.wordcloud_plots}/>    
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching word_cloud generated results:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };
    const handlehistograms= async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
    
        try {
            const response = await fetch("http://localhost:5000/histograms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({filename}),
            });
    
            if (response.ok) {
                const results = await response.json();
    
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <HistogramComponent results={results}/>    
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching word_cloud generated results:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleNgramsanalysis= async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
    
        try {
            const response = await fetch("http://localhost:5000/ngrams_analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({filename, n_range:n_gram}),
            });
    
            if (response.ok) {
                const results = await response.json();
    
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <NGramVisualization plots ={results}/>
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching word_cloud generated results:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handlePredictionAnalysis= async () => {
        if (!filename) {
            alert("No filename available. Please upload a file.");
            return;
        }
        setLoading(true); // Start loading
    
        try {
            const response = await fetch("http://localhost:5000/analyze_performance_metrics", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({filename, n_range:n_gram}),
            });
    
            if (response.ok) {
                const results = await response.json();
    
                setContent(
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <PredictiveAnalysisVisualization performance_results ={results}/>
                    </div>
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error fetching word_cloud generated results:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <HeaderComponent />
            <div className="flex flex-1 relative">
                {/* Left Panel */}
                <div
                    className={`bg-red-500 text-gray-50 flex flex-col transition-transform duration-300 ease-in-out shadow-lg p-4 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ width: '15%' }} // Fixed width for the panel
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">EDA Menu</h2>
                    
                    <button
                        className="py-3 px-4 bg-red-600 hover:bg-red-400 transition duration-200 rounded-md text-left font-semibold mb-3 transform hover:scale-105"
                        onClick={handleInfo} // Added handler for the Info button
                    >
                        Info
                    </button>
                    
                    <button
                        className="py-3 px-4 bg-red-600 hover:bg-red-400 transition duration-200 rounded-md text-left font-semibold mb-3 transform hover:scale-105"
                        onClick={handleDescriptiveStats} // Added handler to the button
                    >
                        Descriptive Statistics
                    </button>
                    
                    <button
                        className="py-3 px-4 bg-red-600 hover:bg-red-400 transition duration-200 rounded-md text-left font-semibold mb-3 transform hover:scale-105"
                        onClick={toggleTextAnalysisSubMenu}
                    >
                        Text Analysis
                    </button>
                    {showTextAnalysisSubMenu && (
                        <div className="pl-4 mb-2 flex flex-col items-start space-y-1"> {/* Left aligned with spacing */}
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105"
                            onClick={handleSentimentAnalysis}
                            >Sentiment Analysis</button>
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105" 
                            onClick={handleTopicModeling}
                            >Topic Modeling</button>
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105"
                            onClick={handlekeyword_extraction}>Keyword Extraction</button>
                        </div>
                    )}

                    <button
                        className="py-3 px-4 bg-red-600 hover:bg-red-400 transition duration-200 rounded-md text-left font-semibold mb-3 transform hover:scale-105"
                        onClick={toggleDataDistributionSubMenu}
                    >
                        Data Distribution
                    </button>
                    {showDataDistributionSubMenu && (
                        <div className="pl-4 mb-2 flex flex-col items-start space-y-1"> {/* Left aligned with spacing */}
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105"
                            onClick={handlehistograms}>Histogram</button>
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105"
                            onClick={handlewordclouds}>Word Cloud Plot</button>
                            <button className="py-2 px-3 bg-red-400 hover:bg-red-300 transition duration-200 rounded-md w-60 text-left transform hover:scale-105"
                            onClick = {handleNgramsanalysis}>N-gram Analysis</button>
                        </div>
                    )}

                    <button className="py-3 px-4 bg-red-600 hover:bg-red-400 transition duration-200 rounded-md text-left font-semibold mb-3 transform hover:scale-105"
                    onClick={handlePredictionAnalysis}>Predictive Analysis</button>
                </div>

                {/* Toggle Button with Icon */}
                <button
                    onClick={togglePanel}
                    className="bg-red-600 text-white w-10 flex items-center justify-center cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 z-10 transition duration-300 ease-in-out border-2 border-red-700 rounded-full"
                    style={{ left: isPanelOpen ? '-20px' : '12px' }} // Adjust position based on panel state
                >
                    {isPanelOpen ? (
                        <XIcon className="h-6 w-6" />
                    ) : (
                        <MenuAlt1Icon className="h-6 w-6" />
                    )}
                </button>

                {/* Right Panel */}
                
                <div className="flex-1 bg-white p-6">
                    <h1 className="text-2xl text-red-600 font-bold mb-4">Exploratory Data Analysis Dashboard</h1>
                    <p className="text-lg text-black-600 font-bold mb-4">Uploaded File: {filename}</p>
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div> {/* Spinner */}
                        </div>
                    ) : (
                        content || <p class="text-lg text-black-500 font-semibold">Start exploring the EDA menu by selecting any options from the left panel</p> // Fallback for no content
                    )}
                </div>
            </div>
        </div>
    );
};

export default EDADashboard;
