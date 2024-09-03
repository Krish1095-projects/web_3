import pandas as pd
import dask.dataframe as dd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import demoji

# Download NLTK stopwords if not already downloaded
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# Initialize demoji
demoji.download_codes()

# Compile regular expressions
link_pattern = re.compile(r'http\S+|www\S+|https\S+', flags=re.MULTILINE)
mention_pattern = re.compile(r'@\w+')
hashtag_pattern = re.compile(r'#\w+')
punctuation_number_pattern = re.compile(r'[^a-zA-Z\s]')  # Removes special characters and numbers

# Initialize stemmer
stemmer = PorterStemmer()



def get_column_name(df, possible_names):
    """
    Function to get the first matching column name from the DataFrame based on a list of possible names.
    """
    for name in possible_names:
        if name in df.columns:
            return name
    return None  # Return None if no matching column is found


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
    tweet = ' '.join(stemmer.stem(word) for word in tweet.split() if word not in stop_words)
    
    return tweet.strip()

def process_tweets_in_chunks(data, chunk_size=10000):
    """
    Processes tweets in chunks using Dask for parallel processing.

    Parameters:
    data (pd.DataFrame or pd.Series): The DataFrame or Series containing tweets.
    chunk_size (int): The size of each chunk to process.

    Returns:
    pd.Series: A series of cleaned tweet texts.
    """
    if isinstance(data, pd.DataFrame):
        text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
        text_col = get_column_name(data, text_col_names)
        data = data[text_col]  # Extract the relevant text column

    # Convert the Series to a Dask DataFrame
    ddf = dd.from_pandas(data, npartitions=len(data) // chunk_size + 1)
    
    # Apply the cleaning function to each tweet in parallel
    cleaned_tweets = ddf.map(clean_tweet, meta=('str')).compute()

    return cleaned_tweets
