from flask import Flask, request, jsonify
from textblob import TextBlob
from transformers import pipeline
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import plotly.graph_objs as go
import plotly.io as pio
import json

nltk.download('vader_lexicon')

# Initialize sentiment analysis pipelines
emotion_analyzer = pipeline('sentiment-analysis', model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
vader_analyzer = SentimentIntensityAnalyzer()

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
    emotion_sums = {key: 0 for key in emotion_data[0].keys()}
    for emotion in emotion_data:
        for key, value in emotion.items():
            emotion_sums[key] += value

    labels = list(emotion_sums.keys())
    values = list(emotion_sums.values())
    fig = go.Figure(data=[go.Pie(labels=labels, values=values)])
    fig.update_layout(title='Emotion Distribution')
    return pio.to_json(fig)
