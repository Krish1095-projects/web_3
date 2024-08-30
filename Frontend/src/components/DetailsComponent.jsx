import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import HeaderComponent from './Header';

const DetailsComponent = () => {
  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-xl max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">Dataset, Model, and Math Details</h1>
      
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Dataset Description</h2>
        <p className="text-lg leading-relaxed text-gray-700 mb-4">
          The dataset used in this project was sourced from Twitter, focusing on tweets containing potential misinformation. It includes features like tweet text, user metadata, and engagement metrics (likes, retweets, replies). The dataset comprises approximately 10 million tweets, collected over six months. The preprocessing steps included:
        </p>
        <ul className="list-disc list-inside pl-6 mb-6 text-gray-700">
          <li className="mb-2">Removing duplicate tweets</li>
          <li className="mb-2">Filtering out non-English tweets</li>
          <li className="mb-2">Tokenizing the tweet text</li>
          <li className="mb-2">Handling missing values in metadata</li>
          <li className="mb-2">Normalizing engagement metrics</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Model Architecture</h2>
        <p className="text-lg leading-relaxed text-gray-700 mb-4">
          The CA-BERT model enhances the BERT architecture with content-based attention. The model includes:
        </p>
        <ul className="list-disc list-inside pl-6 mb-6 text-gray-700">
          <li className="mb-2">Transformer layers for contextual embedding of tweet text</li>
          <li className="mb-2">A content-based attention mechanism for dynamic focus adjustment on tweet parts</li>
          <li className="mb-2">An output layer for classifying the likelihood of misinformation</li>
        </ul>
        <p className="text-lg leading-relaxed text-gray-700">
          The content-based attention modifies the standard attention mechanism, weighing tweet components by content relevance. LIME (Local Interpretable Model-agnostic Explanations) aids in model interpretability, identifying which input parts most influence decisions.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Mathematical Descriptions</h2>
        <p className="text-lg leading-relaxed text-gray-700 mb-4">
          Key mathematical concepts in the CA-BERT model include:
        </p>
        <ul className="list-disc list-inside pl-6 text-gray-700">
          <li className="mb-6">
            <strong className="text-red-600">Updated Content-Based Attention Mechanism:</strong> The attention score for each token in a tweet is calculated using the formula:
            <br />
            <BlockMath math={'\\text{Attention Score} = \\text{softmax}\\left(\\frac{QK^T + \\alpha \\cdot \\text{Syntactic}(Q, K) + \\beta \\cdot \\text{Semantic}(Q, K)}{\\sqrt{d_k}}\\right) \\cdot V'} />
            where:
            <ul className="list-inside pl-6 text-gray-700">
              <li><InlineMath math={'Q'} /> is the query matrix,</li>
              <li><InlineMath math={'K'} /> is the key matrix,</li>
              <li><InlineMath math={'V'} /> is the value matrix,</li>
              <li><InlineMath math={'d_k'} /> is the dimensionality of the key vectors,</li>
              <li><InlineMath math={'\\alpha'} /> and <InlineMath math={'\\beta'} /> are the weights for syntactic and semantic similarity contributions, respectively.</li>
            </ul>
          </li>
          <li className="mb-6">
            <strong className="text-red-600">Syntactic Similarity:</strong> This is computed using the cosine similarity between embeddings of tokens in a tweet, given by:
            <br />
            <BlockMath math={'\\text{Syntactic Similarity}(A, B) = \\frac{A \\cdot B}{\\|A\\| \\|B\\|}'} />
            where <InlineMath math={'A'} /> and <InlineMath math={'B'} /> are the embeddings of two tokens.
          </li>
          <li className="mb-6">
            <strong className="text-red-600">Semantic Similarity:</strong> The semantic similarity between two sentences is calculated using their embeddings as follows:
            <br />
            <BlockMath math={'\\text{Semantic Similarity}(E_1, E_2) = \\frac{\\text{cosine}(E_1, E_2)}{\\sqrt{\\sum{E_1^2} \\sum{E_2^2}}}'} />
            where <InlineMath math={'E_1'} /> and <InlineMath math={'E_2'} /> are the embeddings of the two sentences.
          </li>
          <li className="mb-6">
            <strong className="text-red-600">LIME Explanations:</strong> LIME approximates model predictions with a simpler, interpretable model by perturbing the input data and observing changes in predictions. The explanation is derived by solving a weighted linear regression problem, with weights based on the similarity between the original input and perturbed samples.
          </li>
          <li className="mb-6">
            <strong className="text-red-600">Cross-Entropy Loss:</strong> The model is trained using cross-entropy loss, defined as:
            <br />
            <BlockMath math={'L = - \\left( y \\cdot \\log(p) + (1 - y) \\cdot \\log(1 - p) \\right)'} />
            where <InlineMath math={'y'} /> is the true label and <InlineMath math={'p'} /> is the predicted probability of the label.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DetailsComponent;
