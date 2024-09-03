import pandas as pd
from wordcloud import WordCloud
import plotly.express as px
from text_prep import *

def get_column_name(df, possible_names):
    """
    Function to get the first matching column name from the DataFrame based on a list of possible names.
    """
    for name in possible_names:
        if name in df.columns:
            return name
    return None  # Return None if no matching column is found

def generate_wordclouds_for_labels(documents_df):
    # Define possible column names for text and label
    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
    label_col_names = ['label', 'Label', 'target', 'Target', 'class', 'Class']

    # Identify the text and label columns
    text_col = get_column_name(documents_df, text_col_names)
    label_col = get_column_name(documents_df, label_col_names)
    wordcloud_figures = []
    

    if label_col is None:
        # If no label column is found, generate a single word cloud for the entire data
        documents_df['clean_text'] = process_tweets_in_chunks(documents_df[text_col])
        text = ' '.join(doc for doc in documents_df['clean_text'] if isinstance(doc, str))
        wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
        fig = px.imshow(wordcloud)
        fig.update_layout(
            title='Word Cloud for Whole Data',  # Title for the word cloud
            xaxis=dict(showticklabels=False),
            yaxis=dict(showticklabels=False),
            margin=dict(l=0, r=0, t=50, b=0),  # Increased top margin for title
            paper_bgcolor='white'
        )
        wordcloud_figures.append(fig.to_json())
        
        return wordcloud_figures
    else:
        # Get unique labels
        unique_labels = documents_df[label_col].unique()

        for label in unique_labels:
            # Filter documents for the current label
            documents_df['clean_text'] = process_tweets_in_chunks(documents_df[text_col])
            text = ' '.join(doc for doc in documents_df[documents_df[label_col] == label]['clean_text'] if isinstance(doc, str))
            
            # Create a word cloud object
            wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
            fig = px.imshow(wordcloud)
            fig.update_layout(
                title=f'Word Cloud for Label: {label}',  # Title for each word cloud
                xaxis=dict(showticklabels=False),
                yaxis=dict(showticklabels=False),
                margin=dict(l=0, r=0, t=50, b=0),  # Increased top margin for title
                paper_bgcolor='white'
            )
            
            wordcloud_figures.append(fig.to_json())

        return wordcloud_figures
