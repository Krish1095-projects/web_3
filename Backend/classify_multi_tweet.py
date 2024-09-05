import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer
import os
import pandas as pd 
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, matthews_corrcoef,auc,confusion_matrix,roc_curve
from proposed_work import *
from text_prep import *
import plotly.graph_objects as go
from itertools import cycle
import plotly.express as px

class Error_Performance_Analysis_Visualizer:
    def __init__(self, df):
        self.df = df

    
    def plot_confusion_matrix(self, y_true, y_pred):
        cm = confusion_matrix(y_true, y_pred)
        cm_text = [[str(value) for value in row] for row in cm]

        unique_labels_true = np.unique(y_true)
        unique_labels_pred = np.unique(y_pred)
        
        if cm.shape[0] != len(unique_labels_true) or cm.shape[1] != len(unique_labels_pred):
            raise ValueError("Dimensions of the confusion matrix do not match the number of unique classes.")
        
        fig = go.Figure(data=go.Heatmap(
            z=cm,
            x=unique_labels_pred,
            y=unique_labels_true,
            colorscale='Blues',
            text=cm_text,
            hoverinfo='text'
        ))

        fig.update_layout(
            xaxis_title='Predicted',
            yaxis_title='Actual',
            template='plotly_white'
        )

        return fig.to_json()

    def plot_text_length_distribution(self,y_true_col,y_preds_col,text_col):
        correctly_classified = self.df[self.df[y_true_col] == self.df[y_preds_col]]
        misclassified = self.df[self.df[y_true_col] != self.df[y_preds_col]]

        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=correctly_classified[text_col].apply(len),
            name='Correctly Classified',
            marker_color='green',
            opacity=0.7,
            nbinsx=20
        ))
        fig.add_trace(go.Histogram(
            x=misclassified[text_col].apply(len),
            name='Misclassified',
            marker_color='red',
            opacity=0.7,
            nbinsx=20
        ))

        fig.update_layout(
            xaxis_title='Length of Text',
            yaxis_title='Frequency',
            barmode='overlay',
            template='plotly_white'
        )

        return fig.to_json()

    def plot_roc_curve(self, y_true, y_probs, pos_labels=None, colors=None, show_random_chance=True, custom_title=None):
        n_classes = y_probs.shape[1]
        
        # If pos_labels are not provided, use the class indices as default positive labels
        if pos_labels is None:
            pos_labels = list(range(n_classes))

        # If no custom colors are provided, use a default color cycle
        if colors is None:
            colors = cycle(['blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink'])

        fig = go.Figure()

        # Iterate over classes and dynamically compute ROC curves
        for i, (color, pos_label) in enumerate(zip(colors, pos_labels)):
            fpr, tpr, _ = roc_curve(y_true, y_probs[:, i], pos_label=pos_label)
            fig.add_trace(go.Scatter(
                x=fpr, y=tpr,
                mode='lines',
                name=f'ROC Curve Class {pos_label}',
                line=dict(color=color),
                hoverinfo='x+y'
            ))

        # Optionally add the random chance line
        if show_random_chance:
            fig.add_trace(go.Scatter(
                x=[0, 1], y=[0, 1],
                mode='lines',
                name='Random Chance',
                line=dict(dash='dash', color='black'),
                hoverinfo='none'
            ))

        # Update the layout, making it dynamic with an optional custom title
        fig.update_layout(
            xaxis_title='False Positive Rate',
            yaxis_title='True Positive Rate',
            template='plotly_white'
        )

        return fig.to_json()
    
    def plot_performance_metrics(self, y_true, y_pred):
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred)
        recall = recall_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        mcc = matthews_corrcoef(y_true, y_pred)  # Calculate MCC

        metrics = [accuracy, precision, recall, f1, mcc]  # Add MCC to metrics
        labels = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'MCC']  # Add MCC to labels

        colors = ['blue', 'green', 'orange', 'purple', 'red']  # Specify different colors for each metric

        fig = go.Figure(data=[go.Bar(x=labels, y=metrics, marker_color=colors)])  # Assign colors to bars
        fig.update_layout(
            title='Model Performance Metrics',
            yaxis=dict(range=[-1, 1]),  # Adjust range to include MCC, which can be negative
            template='plotly_white'
        )

        return fig.to_json()

def classify_tweet_proposed(tweet, device):
    # Set the model to evaluation mode
    quantized_model.eval()
    # Tokenize the tweet with truncation and padding
    inputs = tokenizer(tweet, return_tensors="pt", truncation=True, padding='max_length', max_length=140)
    # Move input tensors to the specified device
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)
    with torch.no_grad():
        # Get the model outputs (assuming the model returns outputs, and you are not using a hidden state)
        outputs = quantized_model(input_ids, attention_mask)
        # Check if outputs contain logits or probabilities, adjust accordingly
        if isinstance(outputs, tuple):
            logits = outputs[0]  # Typically the first element contains logits
        else:
            logits = outputs
    # Apply sigmoid to get probabilities
    probabilities = torch.sigmoid(logits)
    # Convert probabilities to a list and return
    return probabilities.cpu().tolist()

def classify_tweets_batch(tweets, device):
    probabilities_list = []
    for tweet in tweets:
        probabilities = classify_tweet_proposed(tweet, device)
        probabilities_list.append(probabilities[0])  # Assuming each output is a list
    return probabilities_list

def classify_tweets_from_df(df, device):
    # Load the test dataset
    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
    text_col = get_column_name(df, text_col_names)
    df['clean_text'] = process_tweets_in_chunks(df[text_col])
    # Classify tweets
    probabilities = classify_tweets_batch(df['clean_text'].tolist(), device=device)
    if probabilities:
        # Using argmax to find the index of the highest probability
        df['predictions'] = [np.argmax(prob) for prob in probabilities]  # 0 for true information, 1 for misinformation
        
    num_classes = len(probabilities[0]) if probabilities else 0  # Determine number of classes
    df['probabilities'] = probabilities
    # Create new columns for probabilities
    for i in range(num_classes):  # Loop through the number of classes
        df[f'probability_class_{i}'] = [prob[i] for prob in probabilities]
    return df

def compute_metrics(df, device):
    # Classify tweets from the dataframe
    df = classify_tweets_from_df(df, device)
    # Identify the label column
    label_col_names = ['label', 'target', 'Target', 'Label', 'class', 'Class']
    label_col = get_column_name(df, label_col_names)
    # Extract true labels and predictions
    y_true = df[label_col].values
    y_pred = df['predictions'].values
    
    # Encode the true labels to binary values (0 and 1)
    encoder = LabelEncoder()
    y_true_encoded = encoder.fit_transform(y_true)  # Encode to 0 and 1
    y_pred_encoded = encoder.fit_transform(y_pred)

    # Calculate metrics
    accuracy = accuracy_score(y_true_encoded, y_pred_encoded)
    precision = precision_score(y_true_encoded, y_pred_encoded)
    recall = recall_score(y_true_encoded, y_pred_encoded)
    f1 = f1_score(y_true_encoded, y_pred_encoded)
    mcc = matthews_corrcoef(y_true_encoded, y_pred_encoded)
    
    # Calculate misclassification rate
    misclassification_rate = 1 - accuracy
    
    return df, {
        'accuracy': accuracy ,
        'precision': precision ,
        'recall': recall,
        'f1_score': f1,
        'mcc': mcc,
        'misclassification_rate': misclassification_rate,
    }

def Analyze_performance_metrics(df, device):
    # Classify tweets from the dataframe
    df = classify_tweets_from_df(df, device)

    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text','clean_tweet','Clean_tweet']
    text_col = get_column_name(df, text_col_names)
    
    label_col_names = ['label', 'target', 'Target', 'Label', 'class', 'Class']
    label_col = get_column_name(df, label_col_names)
    
    df['label_encoded'] = df[label_col].apply(lambda x : 1 if x == True else 0).values
    y_true = df['label_encoded'].values
    y_pred = df['predictions'].values
    y_probs_2 = np.array(df['probabilities'].tolist())
    print(y_probs_2.shape)
    visualizer = Error_Performance_Analysis_Visualizer(df)
    confusion_matrix_plot = visualizer.plot_confusion_matrix(y_true, y_pred)
    text_length_distribution = visualizer.plot_text_length_distribution('label_encoded', 'predictions', text_col)
    roc_curve_plot = visualizer.plot_roc_curve(y_true, y_probs_2)
    performance_metrics_plot = visualizer.plot_performance_metrics(y_true, y_pred)

    return (confusion_matrix_plot, 
            text_length_distribution, roc_curve_plot, performance_metrics_plot)
