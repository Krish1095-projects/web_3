import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularBar from "./CircularBar";
import BarChart from "./ExplanationComponent";
import HighlightedSentence from "./HighlightedWord";
import PreviewDataTable from "./PreviewDataTable"; 
import { FileProvider, useFileContext } from "../context/FileContext"; // Import FileProvider and useFileContext

const ProposedWork = () => {
  const { setFilename } = useFileContext(); // Get setFilename from context
  const [inputValue, setInputValue] = useState("");
  const [probabilities, setProbabilities] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [previewData, setPreviewData] = useState(null); // State for preview data

  const navigate = useNavigate(); // Use useNavigate hook

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadComplete(false);
    setPreviewData(null); // Reset preview data when a new file is selected
    if (selectedFile) {
      setFilename(selectedFile.name); // Set the filename in context
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);

    // Classify the tweet
    try {
      const classifyResponse = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_text: inputValue,
        }),
      });

      if (classifyResponse.ok) {
        const classifyData = await classifyResponse.json();
        setProbabilities(classifyData.probabilities);
      } else {
        console.error("Failed to classify tweet");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    setExplanationLoading(true);

    try {
      const explainResponse = await fetch("http://localhost:5000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet: inputValue,
        }),
      });

      if (explainResponse.ok) {
        const explainData = await explainResponse.json();
        setExplanation(explainData.explanation);
      } else {
        const errorData = await explainResponse.json();
        console.error("Failed to explain:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setExplanationLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
      setUploadComplete(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handlePreviewData = async (e) => {
    e.preventDefault(); // Prevent page reload
  
    if (!file) {
      alert("Please upload a file first.");
      return;
    }
  
    const filename = file.name; // Use the uploaded file's name
  
    try {
      const response = await fetch("http://localhost:5000/preview-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Preview Data:", data); // Log preview data to debug
  
        if (data && data.first_five && data.last_five) {
          setPreviewData(data); // Set the preview data in state
          console.log("Preview Data State Updated:", data); // Log updated state
        } else {
          console.error("Unexpected data structure:", data);
          alert("Failed to fetch valid preview data.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error from backend:", errorData.error);
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
    }
  };

  const handleEDANav = () => {
    navigate("/proposed/eda-dashboard"); // Change this route to your EDA Dashboard path
  };

  const handlePredictiveAnalysisNav = () => {
    navigate("/proposed/classify_samples"); // Change this route to your EDA Dashboard path
  };
  
  return (
    <FileProvider>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-10">
        <form className="bg-white p-8 rounded-lg shadow-md w-full flex gap-10" onSubmit={handleSubmit}>
          {/* Single Tweet Classification Panel */}
          <div className="flex-1 p-4 border rounded-md shadow">
            <h2 className="text-2xl font-semibold mb-4">Single Tweet Classification</h2>
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter tweet text..."
              className="px-4 py-2 w-full h-32 border rounded-md resize-none focus:outline-none focus:border-red-500"
            />
            <div className="text-center mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
              >
                {loading ? "Classifying..." : "Classify"}
              </button>
              <button
                type="button"
                onClick={handleExplain}
                className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600 ml-4"
                disabled={loading || !inputValue}
              >
                {explanationLoading ? "Generating Explanation..." : "Explain"}
              </button>
            </div>

            {/* Display results */}
            {submitted && (
              <div className="mt-4">
                {probabilities && (
                  <div>
                    <h3 className="text-lg font-semibold">Classification Results:</h3>
                    <p>The probability of this tweet being True Information is {probabilities[0][0] * 100} %</p>
                    <CircularBar percentage={probabilities[0][0] * 100} color="green" />
                    <p>The probability of this tweet being Misinformation is {probabilities[0][1] * 100} %</p>
                    <CircularBar percentage={probabilities[0][1] * 100} color="red" />
                  </div>
                )}
                {explanation && <BarChart data={explanation} />}
                {explanation && <HighlightedSentence explanation={explanation} textInstance={inputValue} />}
              </div>
            )}
          </div>

          {/* Multi-Tweet Classification Panel */}
          <div className="flex-1 p-4 border rounded-md shadow">
            <h2 className="text-2xl font-semibold mb-4">Multi-Tweet Classification</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="px-4 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
            />
            <div className="text-center mt-4">
              <button
                onClick={handleFileUpload}
                className={`px-6 py-2 text-white rounded-md focus:outline-none ${uploadComplete ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                disabled={uploadComplete}
              >
                {uploadComplete ? "Upload Complete" : "Upload File"}
              </button>
            </div>

            {/* Render additional buttons after upload is complete */}
            {uploadComplete && (
              <div className="mt-4 flex justify-around">
                <button
                  onClick={handlePreviewData}
                  className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
                >
                  Preview Data
                </button>
                <button 
                  onClick={handleEDANav}
                  className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
                >
                  EDA Report
                </button>
                <button className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
                onClick={handlePredictiveAnalysisNav}>
                  Predictive Analysis
                </button>
              </div>
            )}

            {/* Render preview data */}
            {previewData && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Preview Data:</h3>
                <h4 className="font-medium">First Five Entries:</h4>
                <PreviewDataTable data={previewData.first_five} />
                <h4 className="font-medium">Last Five Entries:</h4>
                <PreviewDataTable data={previewData.last_five} />
              </div>
            )}
          </div>
        </form>
      </div>
    </FileProvider>
  );
};

export default ProposedWork;
