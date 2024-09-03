from flask import Flask, request, jsonify
from textblob import TextBlob
from transformers import pipeline
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import plotly.graph_objs as go
import plotly.io as pio
import json
from text_prep import *


# Initialize sentiment analysis pipelines
emotion_analyzer = pipeline('sentiment-analysis', model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
vader_analyzer = SentimentIntensityAnalyzer()

def get_column_name(df, possible_names):
    """
    Function to get the first matching column name from the DataFrame based on a list of possible names.
    """
    for name in possible_names:
        if name in df.columns:
            return name
    return None  # Return None if no matching column is found

def analyze_textblob(text):
    """Analyze polarity and subjectivity using TextBlob."""
    blob = TextBlob(text)
    sentiment = blob.sentiment
    return {
        'polarity': sentiment.polarity,
        'subjectivity': sentiment.subjectivity
    }

def analyze_vader(text):
    """Analyze sentiment using VADER."""
    scores = vader_analyzer.polarity_scores(text)
    return {
        'vader_compound': scores['compound'],
        'vader_positive': scores['pos'],
        'vader_negative': scores['neg'],
        'vader_neutral': scores['neu']
    }

def analyze_emotions(text):
    """Analyze emotions using a transformer model."""
    max_length = 514  # Set the maximum length for RoBERTa
    truncated_text = text[:max_length]
    emotion_results = emotion_analyzer(truncated_text)
    emotions = {result['label']: result['score'] for result in emotion_results[0]}
    return emotions

def create_polarity_histogram(polarity_data):
    """Create a histogram for polarity distribution using Plotly."""
    fig = go.Figure(data=[go.Histogram(x=polarity_data)])
    fig.update_layout(title='Polarity Distribution', xaxis_title='Polarity', yaxis_title='Count')
    return pio.to_json(fig)

def create_subjectivity_histogram(subjectivity_data):
    """Create a histogram for subjectivity distribution using Plotly."""
    fig = go.Figure(data=[go.Histogram(x=subjectivity_data)])
    fig.update_layout(title='Subjectivity Distribution', xaxis_title='Subjectivity', yaxis_title='Count')
    return pio.to_json(fig)

def create_vader_pie_chart(vader_data):
    """Create a pie chart for VADER sentiment distribution using Plotly."""
    labels = ['Positive', 'Neutral', 'Negative']
    values = [sum(v['vader_positive'] for v in vader_data),
              sum(v['vader_neutral'] for v in vader_data),
              sum(v['vader_negative'] for v in vader_data)]
    fig = go.Figure(data=[go.Pie(labels=labels, values=values)])
    fig.update_layout(title='VADER Sentiment Distribution')
    return pio.to_json(fig)

def create_emotion_pie_chart(emotion_data):
    """Create a pie chart for emotion distribution using Plotly."""
    # Initialize emotion_sums with all possible emotion keys set to 0
    emotion_sums = {
        'anger': 0,
        'joy': 0,
        'sadness': 0,
        'fear': 0,
        'surprise': 0,
        'disgust': 0,
        'neutral': 0  # Add all possible emotions based on your model's output
    }
    # Accumulate the scores for each emotion
    for emotion in emotion_data:
        for key, value in emotion.items():
            if key in emotion_sums:
                emotion_sums[key] += value
            else:
                emotion_sums[key] = value  # Initialize if the key was missing
    labels = list(emotion_sums.keys())
    values = list(emotion_sums.values())
    # Create the pie chart
    fig = go.Figure(data=[go.Pie(labels=labels, values=values)])
    fig.update_layout(title='Emotion Distribution')
    return pio.to_json(fig)

def handle_sentiments(df):
    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
    text_col = get_column_name(df, text_col_names)
    df['clean_text'] = process_tweets_in_chunks(df[text_col])

    analysis_results = []
    for text in df['clean_text']:
        textblob_result = analyze_textblob(text)
        vader_result = analyze_vader(text)
        emotion_result = analyze_emotions(text)
        analysis_results.append({
            'text': text,
            'textblob': textblob_result,
            'vader': vader_result,
            'emotions': emotion_result
        })

    # Extract data for visualizations
    polarity_data = [result['textblob']['polarity'] for result in analysis_results]
    subjectivity_data = [result['textblob']['subjectivity'] for result in analysis_results]
    vader_data = [result['vader'] for result in analysis_results]
    emotion_data = [result['emotions'] for result in analysis_results]

    # Create visualizations
    polarity_histogram = create_polarity_histogram(polarity_data)
    subjectivity_histogram = create_subjectivity_histogram(subjectivity_data)
    vader_pie_chart = create_vader_pie_chart(vader_data)
    emotion_pie_chart = create_emotion_pie_chart(emotion_data)
    
    return polarity_histogram,subjectivity_histogram,vader_pie_chart,emotion_pie_chart
