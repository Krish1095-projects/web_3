import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer
import os
import pandas as pd 
import numpy as np
from proposed_work import *
from text_prep import *

def classify_tweet(tweet,device):
    inputs = tokenizer(tweet, return_tensors="pt", truncation=True, padding=True)
    input_ids = inputs['input_ids'].to(device)
    attentions = inputs['attention_mask'].to(device)
    with torch.no_grad():
        outputs,_ = quantized_model(input_ids, attentions)
    probabilities = torch.sigmoid(outputs)
    return probabilities.tolist()

def classify_tweets_batch(tweets, device):
    probabilities_list = []
    for tweet in tweets:
        probabilities = classify_tweet(tweet, device)
        probabilities_list.append(probabilities[0])  # Assuming each output is a list
    return probabilities_list

def classify_tweets_from_df(df, device):
    # Load the test dataset
    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
    text_col = get_column_name(df, text_col_names)
    
    # Classify tweets
    probabilities = classify_tweets_batch(df[text_col].tolist(), device=device)
    if probabilities:
        # Using argmax to find the index of the highest probability
        df['predictions'] = [np.argmax(prob) for prob in probabilities]  # 0 for true information, 1 for misinformation
        
    num_classes = len(probabilities[0]) if probabilities else 0  # Determine number of classes
    
    # Create new columns for probabilities
    for i in range(num_classes):  # Loop through the number of classes
        df[f'probability_class_{i}'] = [prob[i] for prob in probabilities]
    return df.to_json()