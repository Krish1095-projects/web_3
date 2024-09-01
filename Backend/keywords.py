import pandas as pd
import plotly.graph_objs as go
from sklearn.feature_extraction.text import TfidfVectorizer
from gensim.models import Word2Vec
import nltk
from nltk.corpus import stopwords
import string
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import numpy as np
import seaborn as sns

# Download NLTK stopwords
nltk.download('stopwords')

# Define stopwords
stop_words = set(stopwords.words('english'))

# Function for TF-IDF keyword extraction
def extract_tfidf_keywords(corpus, n_words=10, n_grams=(1, 1)):
    processed_corpus = []
    for text in corpus:
        # Clean the text and remove stopwords
        cleaned_text = ' '.join(
            word.lower() for word in text.translate(str.maketrans('', '', string.punctuation)).split() 
            if word.lower() not in stop_words
        )
        processed_corpus.append(cleaned_text)

    vectorizer = TfidfVectorizer(ngram_range=n_grams, stop_words='english')
    X = vectorizer.fit_transform(processed_corpus)
    feature_array = X.toarray().sum(axis=0)
    feature_names = vectorizer.get_feature_names_out()
    tfidf_sorting = sorted(zip(feature_names, feature_array), key=lambda x: x[1], reverse=True)
    return tfidf_sorting[:n_words]

# Function for Word2Vec keyword extraction
def extract_word2vec_keywords(corpus, n_words=10):
    tokenized_corpus = []
    for text in corpus:
        cleaned_text = [
            word.lower()
            for word in text.translate(str.maketrans('', '', string.punctuation)).split()
            if word.lower() not in stop_words
        ]
        tokenized_corpus.append(cleaned_text)

    model = Word2Vec(tokenized_corpus, vector_size=100, window=5, min_count=1, workers=4)
    top_words = model.wv.index_to_key[:n_words]
    return top_words

# Function to visualize TF-IDF keywords
def visualize_tfidf_keywords(keywords):
    words, scores = zip(*keywords)
    bar = go.Bar(
        x=scores,
        y=words,
        orientation='h',
        marker=dict(color='rgba(55, 128, 191, 0.7)', line=dict(color='rgba(55, 128, 191, 1.0)', width=2))
    )
    layout = go.Layout(
        title=f'Top {len(keywords)} TF-IDF Keywords',
        xaxis=dict(title='TF-IDF Score'),
        yaxis=dict(title='Keywords'),
        margin=dict(l=100, r=20, t=70, b=70)
    )
    fig = go.Figure(data=[bar], layout=layout)
    fig.show()  # Show the TF-IDF figure

# Function to visualize Word2Vec keywords as a word cloud
def visualize_word2vec_keywords_wordcloud(keywords):
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(' '.join(keywords))
    
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title('Word Cloud of Word2Vec Keywords')
    plt.show()  # Display the word cloud

# Function to visualize Word2Vec keywords using t-SNE
def visualize_word2vec_keywords_tsne(corpus, keywords):
    tokenized_corpus = []
    for text in corpus:
        cleaned_text = [
            word.lower()
            for word in text.translate(str.maketrans('', '', string.punctuation)).split()
            if word.lower() not in stop_words
        ]
        tokenized_corpus.append(cleaned_text)

    model = Word2Vec(tokenized_corpus, vector_size=100, window=5, min_count=1, workers=4)

    # Get embeddings for the keywords
    embeddings = np.array([model.wv[word] for word in keywords if word in model.wv])

    # Check if there are any embeddings
    if embeddings.size == 0:
        print("No valid embeddings found for the provided keywords.")
        return

    # Set a lower perplexity value
    perplexity_value = min(5, embeddings.shape[0] - 1)  # Ensure it’s less than n_samples

    # Apply t-SNE
    tsne = TSNE(n_components=2, perplexity=perplexity_value, random_state=42)
    tsne_results = tsne.fit_transform(embeddings)

    # Create a scatter plot with improved aesthetics
    plt.figure(figsize=(10, 6))
    palette = sns.color_palette("viridis", n_colors=len(keywords))  # Use a color palette
    scatter = plt.scatter(tsne_results[:, 0], tsne_results[:, 1], c=range(len(keywords)), cmap='viridis', s=100, edgecolor='k')

    # Annotate points with colors and larger markers
    for i, word in enumerate(keywords):
        if word in model.wv:
            plt.annotate(word, xy=(tsne_results[i, 0], tsne_results[i, 1]), fontsize=10, ha='right', va='bottom',
                         bbox=dict(boxstyle='round,pad=0.3', edgecolor='none', facecolor=palette[i]))

    plt.title('t-SNE Visualization of Word2Vec Keywords', fontsize=16)
    plt.xlabel('t-SNE Component 1', fontsize=12)
    plt.ylabel('t-SNE Component 2', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.colorbar(scatter, label='Keywords')  # Add a color bar
    plt.tight_layout()
    plt.show()  # Display the t-SNE plot
