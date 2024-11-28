import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import hostname from '../config';
import { FileProvider, useFileContext } from "../context/FileContext"; // Import FileProvider and useFileContext
import CircularBar from "./CircularBar";
import BarChart from "./ExplanationComponent";
import HighlightedSentence from "./HighlightedWord";
import PreviewDataTable from "./PreviewDataTable";

const ProposedWork = () => {
  const { setFilename } = useFileContext(); // Get setFilename from context
  const [inputValue, setInputValue] = useState("");
  const [probabilities, setProbabilities] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [GeneratingReportLoading, setGeneratingReportLoading] = useState(false);
  const [PreviewDataLoading, setPreviewDataLoadingLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [previewData, setPreviewData] = useState(null); // State for preview data
  const [reportSuccess, setReportSuccess] = useState(false);

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
      const classifyResponse = await fetch('${hostname}/classify', {
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
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3582825929.
        console.log(`Classification Result:, ${hostname}/classify`)
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
  
      const explainResponse = await fetch("${hostname}/explain", {
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
      const response = await fetch("${hostname}/upload-file", {
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
    setPreviewDataLoadingLoading(true)
  
    if (!file) {
      alert("Please upload a file first.");
      return;
    }
  
    const filename = file.name; // Use the uploaded file's name
  
    try {
      const response = await fetch("${hostname}/preview-data", {
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
    }finally{
      setPreviewDataLoadingLoading(false)
    }
  };

  const handleEDANav = () => {
    navigate("/proposed/eda-dashboard"); // Change this route to your EDA Dashboard path
  };

  const handlePredictionreport = async (e) => {
    e.preventDefault(); // Prevent page reload
    setGeneratingReportLoading(true)
    setReportSuccess(false)
    if (!file) {
      alert("Please upload a file first.");
      return;
    }
  
    const filename = file.name; // Use the uploaded file's name
  
    try {
      const response = await fetch("${hostname}/generate_prediction_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Prediction Report Data:", data); // Log preview data for debugging
  
        // Convert the data to a blob
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
  
        // Create a link to download the file
        const a = document.createElement("a");
        a.href = url;
        a.download = `prediction_report_${filename}.json`; // Name of the downloaded file
        document.body.appendChild(a);
        a.click(); // Simulate a click to download the file
        document.body.removeChild(a); // Remove the link from the DOM
  
      } else {
        console.error("Failed to fetch prediction report. Response status:", response.status);
        alert("There was an error fetching the prediction report. Please try again.");
      }
    } catch (error) {
      console.error("Error occurred while fetching prediction report:", error);
      alert("An error occurred. Please check the console for more details.");
    }finally{
      setGeneratingReportLoading(false)
    }
  };

  
  
  return (
    <FileProvider>
      <div className="flex flex-col justify-center items-center min-h-screen bg-white-100 p-10">
        {/* Title Section */}
        <div className="flex flex-col  w-[90%] bg-white-100 p-6 rounded-lg mb-20 mx-20">
          <h1 className="flex justify-center items-center text-red-600 font-bold  mb-10 text-3xl text-center">
            Misinformation Detection on Twitter with a Content-Attention-Based Multilingual BERT Model
          </h1>
        </div>
        {/* Instructions Section */}
        <div className="mb-8 w-full flex gap-4">
        {/* General Instructions Panel */}
        <div className="flex-1 bg-red-50 border-l-4 border-r-4 border-red-400 p-4 rounded-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">General Instructions</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>For the <strong>Single Tweet Classification</strong>, enter the tweet text in the provided textarea.</li>
            <li>Click the <strong>Classify</strong> button to receive the classification results.</li>
            <li>If you need an explanation of the classification, click the <strong>Explain</strong> button after classifying.</li>
            <li>For the <strong>Multi-Tweet Classification</strong>, upload a file containing multiple tweets.</li>
            <li>After the upload, you can preview the data or navigate to the EDA Dashboard for detailed analysis.</li>
            <li>Generate a prediction report after classifying your tweets by clicking the <strong>Prediction Report</strong> button.</li>
          </ul>
        </div>

        {/* Warnings Panel */}
        <div className="flex-1 bg-red-50 border-l-4 border-r-4 border-red-400 p-4 rounded-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Warnings</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Ensure your uploaded file is of type <strong>.csv</strong> or <strong>.xlsx</strong> or <strong>.json</strong> .</li>
            <li>Maximum file size allowed is <strong>5MB</strong>.</li>
            <li>Each uploaded file should contain no more than <strong>2000 sample tweets</strong>.</li>
            <li>Ensure the feature names match the keywords provided below.</li>
            <li>For <strong>text</strong> features, accepted names are: <strong>'tweet'</strong>, <strong>'Tweet'</strong>, <strong>'text'</strong>, <strong>'Text'</strong>, <strong>'clean_text'</strong>, <strong>'Clean_text'</strong>.</li>
            <li>For <strong>label</strong> features, accepted names are: <strong>'label'</strong>, <strong>'target'</strong>, <strong>'Target'</strong>, <strong>'Label'</strong>, <strong>'class'</strong>, <strong>'Class'</strong>. </li>
          </ul>
        </div>
      </div>

        {/* Classification Panels */}
        <form className="bg-red-50 p-8 rounded-lg border-l-4 border-r-4 border-red-400 shadow-md w-full flex gap-10" onSubmit={handleSubmit}>
          {/* Single Tweet Classification Panel */}
          <div className="flex-1 p-4 bg-red-50 border-l-4 border-r-4 border-red-400 p-4 rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Single Tweet Classification</h2>
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
          <div className="flex-1 p-4 bg-red-50 border-l-4 border-r-4 border-red-400 p-4 rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Multi-Tweet Classification</h2>
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
                  {PreviewDataLoading ? "Loading Preview data" : "Preview data"}
                </button>
                <button 
                  onClick={handleEDANav}
                  className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
                >
                  EDA Dashboard
                </button>
                <button className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
                onClick={handlePredictionreport}>
                  {GeneratingReportLoading ? "Generating Report.." : "Prediction Report"}
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
            {/* Success Message for Report Generation */}
            {reportSuccess && (
              <div className="mt-4 p-2 text-green-600 bg-green-100 border border-green-200 rounded">
                Prediction report generated successfully!
              </div>
            )}
          </div>
        </form>
      </div>
    </FileProvider>
  );
};

export default ProposedWork;
