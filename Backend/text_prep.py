import pandas as pd
import dask.dataframe as dd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.stem import PorterStemmer
import demoji

# Download NLTK stopwords if not already downloaded
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')

# Compile regular expressions
link_pattern = re.compile(r'http\S+|www\S+|https\S+', flags=re.MULTILINE)
mention_pattern = re.compile(r'@\w+')
hashtag_pattern = re.compile(r'#\w+')
punctuation_number_pattern = re.compile(r'[^a-zA-Z\s]')  # Removes special characters and numbers

# Initialize the lemmatizer and stop words
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def get_wordnet_pos(treebank_tag):
    """Map NLTK POS tags to WordNet POS tags."""
    if treebank_tag.startswith('J'):
        return 'a'  # Adjective
    elif treebank_tag.startswith('V'):
        return 'v'  # Verb
    elif treebank_tag.startswith('N'):
        return 'n'  # Noun
    elif treebank_tag.startswith('R'):
        return 'r'  # Adverb
    else:
        return None  # Not a WordNet POS

def lemmatize_tweet(tweet):
    """Lemmatize a tweet by removing stop words and applying POS tagging."""
    # Tokenize the tweet
    tokens = nltk.word_tokenize(tweet)
    
    # Perform POS tagging
    pos_tags = nltk.pos_tag(tokens)
    
    # Lemmatize the tweet
    lemmatized_tweet = ' '.join(
        lemmatizer.lemmatize(word, pos=get_wordnet_pos(pos)) if get_wordnet_pos(pos) else word 
        for word, pos in pos_tags if word.lower() not in stop_words
    )
    
    return lemmatized_tweet
# Initialize stemmer


def clean_tweet(tweet):
    """
    Cleans a single tweet.

    Parameters:
    tweet (str): The tweet text to clean.

    Returns:
    str: The cleaned tweet text.
    """
    # Remove links, mentions, hashtags using regular expressions
    tweet = re.sub(link_pattern, '', tweet)
    tweet = re.sub(mention_pattern, '', tweet)
    tweet = re.sub(hashtag_pattern, '', tweet)
    
    # Remove punctuation, numbers, and special characters
    tweet = re.sub(punctuation_number_pattern, '', tweet)
    
    # Remove emojis using demoji
    tweet = demoji.replace(tweet)
    
    # Convert to lowercase
    tweet = tweet.lower()
    
    # Remove stopwords and apply stemming
    tweet = lemmatize_tweet(tweet)
    
    return tweet.strip()

def process_tweets_in_chunks(df, chunk_size=10000):
    """
    Processes tweets in chunks using Dask for parallel processing.

    Parameters:
    df (pd.DataFrame): The DataFrame containing tweets.
    chunk_size (int): The size of each chunk to process.

    Returns:
    pd.Series: A series of cleaned tweet texts.
    """
    # Convert DataFrame to Dask DataFrame
    ddf = dd.from_pandas(df, npartitions=len(df) // chunk_size + 1)

    # Apply the cleaning function to each tweet in parallel
    cleaned_tweets = ddf['Tweet'].map(clean_tweet, meta=('Tweet', 'str')).compute()

    return cleaned_tweets
