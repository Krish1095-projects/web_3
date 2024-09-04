import React, { useState } from "react";
import CircularBar from "./CircularBar";
import BarChart from "./ExplanationComponent";
import HighlightedSentence from "./HighlightedWord";
import FactCheckCard from "./Fact_Check";

const ExistingWork = () => {
  const [inputValue, setInputValue] = useState("");
  const [probabilities, setProbabilities] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [factCheckData, setFactCheckData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);

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

        // Call explain API
        const explainResponse = await fetch("http://localhost:5000/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: inputValue,
          }),
        });

        if (explainResponse.ok) {
          const explainData = await explainResponse.json();
          setExplanation(explainData.explanation);

          // Call fact-check API
          const factCheckResponse = await fetch(
            "http://localhost:5000/fact-check",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                claim: inputValue, // Assuming inputValue is the claim text
              }),
            }
          );

          if (factCheckResponse.ok) {
            const factCheckData = await factCheckResponse.json();
            setFactCheckData(factCheckData);
          } else {
            console.error("Failed to fact-check claim");
          }
        } else {
          console.error("Failed to explain");
        }
      } else {
        console.error("Failed to classify tweet");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-red-500 text-black p-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full flex flex-col gap-20 mx-10"
      >
        <div className="flex flex-row w-full  bg-white text-black gap-20">
          <div className={`flex flex-col w-1/2 gap-10`}>
            <div
              className={`mb-4 text-black transition-transform duration-500 ease-in-out ${
                submitted ? "-translate-x-1" : "translate-x-0"
              }`}
            >
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter tweet text..."
                className="px-4 py-2 w-full h-32 border rounded-md resize-none focus:outline-none focus:border-red-500"
                style={{ verticalAlign: "top" }}
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-md focus:outline-none hover:bg-red-600"
              >
                {loading ? "Classifying..." : "Classify"}
              </button>
            </div>
          </div>
          <div
            className={`w-1/2 transition-transform duration-200 ease-in-out transform ${
              submitted ? "scale-105" : "scale-0"
            }`}
          >
            {probabilities && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  Classification Results:
                </h3>
                <p>
                  The probability of this tweet being True information is{" "}
                  {probabilities[0][0] * 100} %
                </p>
                <CircularBar
                  percentage={probabilities[0][0] * 100}
                  color="red"
                />
                <p>
                  The probability of this tweet being Misinformation is{" "}
                  {probabilities[0][1] * 100} %
                </p>
                <CircularBar
                  percentage={probabilities[0][1] * 100}
                  color="green"
                />
              </div>
            )}
          </div>
        </div>
        {explanation && <BarChart data={explanation} />}
        {explanation && (
          <HighlightedSentence
            explanation={explanation}
            textInstance={inputValue}
          />
        )}
         {factCheckData && (
          <FactCheckCard
            articleTitle={factCheckData.article_title}
            articleUrl={factCheckData.article_url}
            authorName={factCheckData.author_name}
            claim={factCheckData.claim}
            dateTimePosted={factCheckData.date_time_posted}
            ratingTitle={factCheckData.rating_title}
          />)}
      </form>
    </div>
  );
};

export default ExistingWork;
