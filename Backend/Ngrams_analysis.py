import pandas as pd
import plotly.express as px
from sklearn.feature_extraction.text import CountVectorizer

def generate_ngrams(df, text_column, n_range=(1, 6)):
    """
    Generate N-grams from the specified text column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The DataFrame containing the text data.
        text_column (str): The column name in the DataFrame that contains the text.
        n_range (tuple): A tuple specifying the range of N for N-grams.

    Returns:
        dict: A dictionary containing N-gram counts for each N.
    """
    ngram_counts = {}

    for n in range(n_range[0], n_range[1] + 1):
        vectorizer = CountVectorizer(ngram_range=(n, n))
        ngram_matrix = vectorizer.fit_transform(df[text_column])
        ngram_sum = ngram_matrix.sum(axis=0)

        ngram_counts[n] = {
            'ngram': vectorizer.get_feature_names_out(),
            'count': ngram_sum.A1  # Convert matrix to 1D array
        }

    return ngram_counts


def plot_ngrams(ngram_counts):
    """
    Generate the N-gram plots using Plotly and return as JSON.

    Parameters:
        ngram_counts (dict): A dictionary containing N-gram counts for each N.

    Returns:
        dict: A dictionary containing JSON representations of the N-gram plots.
    """
    plots = {}
    for n, data in ngram_counts.items():
        df_ngrams = pd.DataFrame({
            'ngram': data['ngram'],
            'count': data['count']
        }).sort_values(by='count', ascending=False).head(10)  # Top 10 N-grams

        fig = px.bar(df_ngrams, x='ngram', y='count',
                     labels={'ngram': 'N-gram keywords', 'count': 'Count'},
                     color='count', color_continuous_scale=px.colors.sequential.Viridis)

        # Rename the key to a more descriptive name
        key_name = f"{n}-gram"
        plots[key_name] = fig.to_json()

    return plots


def analyze_ngrams(df, text_column, n_range=(1, 4)):
    """
    Analyze N-grams from the text column of a DataFrame and return the plots as JSON.

    Parameters:
        df (pd.DataFrame): The DataFrame containing the text data.
        text_column (str): The column name in the DataFrame that contains the text.
        n_range (tuple): A tuple specifying the range of N for N-grams.

    Returns:
        dict: A dictionary containing JSON representations of the N-gram plots.
    """
    ngram_counts = generate_ngrams(df, text_column, n_range)
    return plot_ngrams(ngram_counts)