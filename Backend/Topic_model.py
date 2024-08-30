import pandas as pd
import gensim
import gensim.corpora as corpora
import pyLDAvis
import pyLDAvis.gensim_models as gensimvis
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import os


# Initialize NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

def preprocess(text):
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    filtered_tokens = [word for word in tokens if word.isalnum() and word not in stop_words]
    return filtered_tokens

def load_data(filename):
    # Load the data based on the file extension
    if filename.endswith('.csv'):
        df = pd.read_csv(filename)
    elif filename.endswith('.xlsx'):
        df = pd.read_excel(filename)
    elif filename.endswith('.json'):
        df = pd.read_json(filename)
    else:
        raise ValueError("Unsupported file format. Please use CSV, Excel, or JSON.")

    text_columns = [col for col in df.columns if col in ('tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text')]
    
    if not text_columns:
        raise ValueError("No suitable text column found in the data.")
    
    # Return the content of the identified text column(s) as a list
    return df[text_columns[0]].dropna().tolist()

def create_lda_model(documents, num_topics=5, passes=15):
    processed_docs = [preprocess(doc) for doc in documents]
    dictionary = corpora.Dictionary(processed_docs)
    corpus = [dictionary.doc2bow(doc) for doc in processed_docs]
    
    lda_model = gensim.models.LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=passes)
    
    # Get the topics with their keywords
    topics = lda_model.print_topics(num_words=5)
    topics_results = [(i, topic) for i, topic in topics]
    
    return lda_model, corpus, dictionary

def visualize_topics(lda_model, corpus, dictionary):
    vis = gensimvis.prepare(lda_model, corpus, dictionary)
    return pyLDAvis.prepared_data_to_html(vis)


