import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline  # Import make_pipeline function
from sklearn.model_selection import train_test_split
import lime
import lime.lime_text
import nltk 
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
nltk.download('punkt')
import os
import pickle
# Load your data into df
df = pd.read_csv(os.path.join(os.getcwd(),'fourth.csv'))

# Handle NaN values in the 'clean_text' column by replacing them with empty strings
df['clean_text'] = df['clean_text'].fillna('')

# Split the data into training, validation, and test sets
train_text, temp_text, train_labels, temp_labels = train_test_split(df['clean_text'], df['label'],
                                                                    random_state=2018,
                                                                    test_size=0.3,
                                                                    stratify=df['label'])

val_text, test_text, val_labels, test_labels = train_test_split(temp_text, temp_labels,
                                                                random_state=2018,
                                                                test_size=0.5,
                                                                stratify=temp_labels)

# Define the list of stop words
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

# Create a text classification pipeline
pipeline = make_pipeline(TfidfVectorizer(), LogisticRegression())

# Train the model
pipeline.fit(train_text, train_labels)

with open('model_lime.pkl', 'wb') as f:
    pickle.dump(pipeline, f)