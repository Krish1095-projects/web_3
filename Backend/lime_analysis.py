from flask import request, jsonify
import pickle
import numpy as np
import pandas as pd
import lime
import lime.lime_text
import os
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import torch.amp
from existing_work import *
import nltk 
nltk.download('stopwords')
nltk.download('punkt')
stopwords_list =stopwords.words(['english','spanish','french','german','dutch'])
# Create a set from the stop words list
stop_words = set(stopwords_list)

def remove_stopwords(text_data):
    # Tokenize the text data
    words = word_tokenize(text_data)

    # Remove stopwords
    filtered_words = [word for word in words if word.lower() not in stop_words]

    # Join the filtered words back into a string
    filtered_text = ' '.join(filtered_words)

    return filtered_text

# Wrapper function for the BERT model
def bert_predict_proba(texts):
    inputs = tokenizer(texts, return_tensors="pt", truncation=True, padding=True)
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)
    with torch.no_grad():
        logits = quantized_model(input_ids, attention_mask)
        probabilities = torch.sigmoid(logits)
    return probabilities.cpu().numpy()

# Create a LimeTextExplainer
explainer = lime.lime_text.LimeTextExplainer()

def explain_text(explainer, text_data):
    try:

        data = remove_stopwords(text_data)
        # Explain the model's prediction for the chosen instance
        explanation = explainer.explain_instance(data, bert_predict_proba)

        # Get the explanation data
        explanation_data = {
            "text_instance": data,
            "explanation": explanation.as_list()
        }

        return jsonify(explanation_data), 200

    except Exception as e:
        error_message = {"error": str(e)}
        return jsonify(error_message), 400
