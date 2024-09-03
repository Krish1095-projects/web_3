import pandas as pd
import plotly.graph_objects as go
from collections import Counter
import plotly.express as px
import spacy
import re
from text_prep import *


def get_column_name(df, possible_names):
    """
    Function to get the first matching column name from the DataFrame based on a list of possible names.
    """
    for name in possible_names:
        if name in df.columns:
            return name
    return None  # Return None if no matching column is found


def calculate_text_statistics(df):
    
    # Define possible column names for text and label
    text_col_names = ['tweet', 'Tweet', 'text', 'Text']
    text_col = get_column_name(df, text_col_names)
    df['clean_text'] = process_tweets_in_chunks(df[text_col])
    df = df.dropna()
    df = df[df['clean_text'].apply(lambda x : isinstance(x,str))]
    if text_col is None:
        raise ValueError("No suitable text column found in the DataFrame.")
    
    # Function to calculate character count
    def character_count(text):
        return len(text)

    # Function to calculate sentence length
    def sentence_length(text):
        sentences = re.split(r'[.!?]+', text)
        return len(sentences) - 1 if sentences[-1] == '' else len(sentences)

    # Function to calculate word count
    def word_count(text):
        return len(text.split())

    # Calculate character counts, sentence lengths, and word counts
    df['character_count'] = df['clean_text'].apply(character_count)
    df['sentence_length'] = df['clean_text'].apply(sentence_length)
    df['word_count'] = df['clean_text'].apply(word_count)

    # Generate histograms as Plotly figures
    def plot_character_count():
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=df['character_count'],
            marker_color='blue',
            opacity=0.7,
            name='Character Count'
        ))
        fig.update_layout(
            title='Character Count Distribution',
            xaxis_title='Number of Characters',
            yaxis_title='Frequency',
            bargap=0.2,
        )
        return fig

    def plot_sentence_length():
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=df['sentence_length'],
            marker_color='green',
            opacity=0.7,
            name='Sentence Length'
        ))
        fig.update_layout(
            title='Sentence Length Distribution',
            xaxis_title='Number of Sentences',
            yaxis_title='Frequency',
            bargap=0.2,
        )
        return fig

    def plot_word_count():
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=df['word_count'],
            marker_color='orange',
            opacity=0.7,
            name='Word Count'
        ))
        fig.update_layout(
            title='Word Count Distribution',
            xaxis_title='Number of Words',
            yaxis_title='Frequency',
            bargap=0.2,
        )
        return fig

    # Call the plotting functions and return the figures
    character_count_fig = plot_character_count()
    sentence_length_fig = plot_sentence_length()
    word_count_fig = plot_word_count()

    return character_count_fig.to_json(), sentence_length_fig.to_json(), word_count_fig.to_json()

def time_series_document_lengths(documents_df):
    # Ensure the DataFrame has a text column
    text_col_names = ['tweet', 'Tweet', 'text', 'Text', 'clean_text', 'Clean_text']
    text_col = get_column_name(documents_df, text_col_names)
    timestamp_col_names = ['Date', 'date', 'created_at']
    timestamp_col = get_column_name(documents_df, timestamp_col_names)
    
    # Drop any rows with NaN values
    documents_df = documents_df.dropna()
    
    if text_col is None:
        raise ValueError("No suitable text or timestamp columns found in the DataFrame.")
    if timestamp_col is None:
        return calculate_text_statistics(documents_df)

    # Ensure timestamp column is in datetime format
    documents_df[timestamp_col] = pd.to_datetime(documents_df[timestamp_col])

    # Calculate document lengths (in words)
    documents_df['length'] = documents_df[text_col].apply(lambda x: len(str(x).split()))

    # Ensure the length column is numeric
    documents_df['length'] = pd.to_numeric(documents_df['length'], errors='coerce')

    # Reset the index to access the timestamp column again if necessary
    if timestamp_col not in documents_df.columns:
        documents_df.reset_index(inplace=True)

    # Set the timestamp column as index
    documents_df.set_index(timestamp_col, inplace=True)

    # Calculate average lengths for different frequencies
    average_daily_length = documents_df['length'].resample('D').mean().reset_index()
    average_weekly_length = documents_df['length'].resample('W').mean().reset_index()
    average_monthly_length = documents_df['length'].resample('M').mean().reset_index()
    

    # Add frequency identifiers
    average_daily_length['frequency'] = 'Daily'
    average_weekly_length['frequency'] = 'Weekly'
    average_monthly_length['frequency'] = 'Monthly'
   

    # Combine all into a single DataFrame
    combined_average_length = pd.concat([
        average_daily_length,
        average_weekly_length,
        average_monthly_length,
    ])

    # Create a time series plot
    fig = px.line(
        combined_average_length,
        x=timestamp_col,
        y='length',
        color='frequency',
        title='Average Document Length Over Time',
        labels={timestamp_col: 'Date', 'length': 'Average Document Length (Number of Words)'},
        color_discrete_sequence=['blue', 'red', 'green']
    )

    fig.update_layout(
        xaxis_title='Date',
        yaxis_title='Average Document Length',
        paper_bgcolor='white',
        plot_bgcolor='rgba(255, 255, 255, 0.85)',
        title=dict(
            text='Average Document Length Over Time',
            font=dict(size=24, color='black'),
            xanchor='center',
            x=0.5,
            yanchor='top',
            y=0.95
        ),
        xaxis=dict(
            titlefont=dict(size=18, color='black'),
            tickfont=dict(size=14, color='black'),
            gridcolor='lightgray',
            showgrid=True,
            zeroline=True,
            zerolinecolor='lightgray',
            zerolinewidth=1
        ),
        yaxis=dict(
            titlefont=dict(size=18, color='black'),
            tickfont=dict(size=14, color='black'),
            gridcolor='lightgray',
            showgrid=True,
            zeroline=True,
            zerolinecolor='lightgray',
            zerolinewidth=1
        ),
        legend=dict(
            title='Frequency',
            title_font=dict(size=16, color='black'),
            font=dict(size=14, color='black'),
            bgcolor='rgba(255, 255, 255, 0.7)',
            bordercolor='black',
            borderwidth=1,
        ),
        margin=dict(l=50, r=50, t=50, b=50)
    )


    return fig.to_json()

