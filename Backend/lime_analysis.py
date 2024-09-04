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
from proposed_work import *
from text_prep import clean_tweet

# Wrapper function for the BERT model
def bert_predict_proba(texts):
    inputs = tokenizer(texts, return_tensors="pt", truncation=True, padding=True)
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)
    with torch.no_grad():
        logits,_ = quantized_model(input_ids, attention_mask)
        probabilities = torch.sigmoid(logits)
    return probabilities.cpu().numpy()

# Create a LimeTextExplainer
explainer = lime.lime_text.LimeTextExplainer()

def explain_text(explainer, text_data):
    try:

        data = clean_tweet(text_data)
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
