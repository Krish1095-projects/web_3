import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from gensim.models import Word2Vec
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict
from wordcloud import WordCloud
import plotly.express as px
import plotly.graph_objects as go
import os

# Ensure you have downloaded the necessary NLTK data
import nltk
nltk.download('punkt')
nltk.download('stopwords')

# Ensure the directory for saving images exists
os.makedirs('static/visualizations', exist_ok=True)

# Function to preprocess text
def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    tokens = [word for word in tokens if word.isalnum() and word not in stop_words]
    return tokens
# Function for Word2Vec keyword extraction
def extract_keywords_word2vec(documents, top_n=10, vector_size=100, window=5, min_count=2):
    tokenized_docs = [preprocess_text(doc) for doc in documents]
    word2vec_model = Word2Vec(sentences=tokenized_docs, vector_size=vector_size, window=window, min_count=min_count, workers=4)

    keyword_scores = defaultdict(float)
    for doc in tokenized_docs:
        for word in doc:
            if word in word2vec_model.wv:
                keyword_scores[word] += word2vec_model.wv[word].mean()

    sorted_keywords = sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_keywords[:top_n]

# Function for TF-IDF keyword extraction
def extract_keywords_tfidf(documents, top_n=10):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)
    feature_names = vectorizer.get_feature_names_out()
    
    # Get the TF-IDF scores for each document
    tfidf_scores = tfidf_matrix.toarray()
    
    # Aggregate scores for each keyword
    avg_tfidf_scores = tfidf_scores.mean(axis=0)
    
    # Get the top_n keywords with their scores
    top_n_indices = avg_tfidf_scores.argsort()[-top_n:][::-1]
    
    top_keywords = {feature_names[i]: avg_tfidf_scores[i] for i in top_n_indices}
    return top_keywords

def plot_tfidf_keywords(tfidf_scores, top_n=10):
    # Sort the keywords and scores
    sorted_keywords = sorted(tfidf_scores.items(), key=lambda item: item[1], reverse=True)[:top_n]
    keywords, scores = zip(*sorted_keywords)  # Unzip the sorted results

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=scores,
        y=keywords,
        orientation='h'
    ))
    
    # Set layout properties
    fig.update_layout(
        title='TF-IDF Keyword Extraction',
        xaxis_title='TF-IDF Score',
        yaxis_title='Keywords'
    )
    
    return fig.to_json()  # Return as JSON for the frontendmat

def generate_word2vec_word_cloud(documents, top_n=10):
    word2vec_keywords = extract_keywords_word2vec(documents, top_n=top_n)
    word2vec_text = ' '.join([word for word, _ in word2vec_keywords])
    
    # Generate the Word Cloud
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(word2vec_text)
    
    # Create a Plotly figure from the Word Cloud
    fig = px.imshow(wordcloud, title="Word2Vec Keywords Word Cloud")
    
    # Remove axis
    fig.update_layout(
        xaxis_visible=False,
        yaxis_visible=False
    )

    # Convert the figure to JSON
    return fig.to_json()
