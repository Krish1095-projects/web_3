from flask import Flask, request, jsonify,render_template
import re
from flask_cors import CORS
from existing_work import classify_tweet as classify_tweet_existing, device as device_existing
import lime_analysis
import os
from descriptive_stats import *
import pandas as pd
from Topic_model import *
from sentiment import  *
from keywords import *
from wordclouds import *
from text_stats import *
import nltk
import warnings

warnings.filterwarnings('ignore')
# Initialize NLTK resources
nltk.download('all',quiet=True)


app = Flask(__name__, template_folder='templates')
UPLOAD_FOLDER = 'uploads'
VIS_FOLDER ='visuals'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'csv', 'json', 'xlsx'}  # Define allowed file extensions

# Store uploaded file information
uploaded_files = {}  # Dictionary to keep track of uploaded files

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

CORS(app)

@app.route('/classify', methods=['POST'])
def classify_existing():
    data = request.get_json()
    tweet = data.get('tweet_text', '')
    probabilities = classify_tweet_existing(tweet, device=device_existing)
    return jsonify({'probabilities': probabilities})

@app.route('/explain', methods=['POST'])
def route_explain_text():
    try:
        # Get the tweet text from the request
        data = request.json
        tweet = data['tweet']
        if not isinstance(tweet, str) or not tweet.strip():
            return jsonify({"error": "Text data not provided"}), 400
        
        return lime_analysis.explain_text(lime_analysis.explainer, tweet)
       
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/upload-file', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']  # Retrieve the file from the request

    # Check if the file is valid and save it
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file format. Only .csv, .xlsx, and .json files are allowed."}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)  # Save the file to the specified location   
   
    # Store the filename in the dictionary
    uploaded_files['latest'] = file_path  # Save the last uploaded file path

    return jsonify({"message": f"File '{file.filename}' uploaded successfully!", "filename": file.filename}), 200

@app.route('/preview-data', methods=['POST'])
def preview_data():
    try:
        data = request.get_json()
        filename = data['filename']
        file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)

        # Determine the file type and load accordingly
        if filename.endswith('.json'):
            df = pd.read_json(file_path, orient='records')
        elif filename.endswith('.csv'):
            df = pd.read_csv(file_path, engine='python')
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # Replace NaN values with None for JSON serialization
        df = df.where(pd.notnull(df), None)

        # Get the first and last five rows
        preview = {
            "first_five": df.head().to_dict(orient="records"),
            "last_five": df.tail().to_dict(orient="records")
        }
        
        return jsonify(preview)

    except FileNotFoundError:
        return jsonify({"error": f"File '{filename}' not found"}), 404
    except ValueError as e:
        return jsonify({"error": f"Value error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    

@app.route('/des_stats', methods=['POST'])
def descriptive_statistics():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        filename = data.get('filename')
    
        file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    
        # Process the file
        processor = DataProcessor(file_path)
        processor.load_data()
        total_size = processor.get_count()
        data_types = processor.get_data_types() 
        missing_values = processor.get_missing_values()
        label_dist = processor.get_label_distribution()

        # Combine the results into a single dictionary
        results = {
            "label_distribution":label_dist,
            "total_entries": total_size,
            "data_types": data_types,
            "missing_values": missing_values
        }
        

        # Return the combined results as JSON
        return jsonify(results), 200

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@app.route('/topic_modeling', methods=['POST'])
def topic_modeling():
    try:
        data = request.get_json()
        filename = data.get('filename')
        num_topics = data.get('num_topics', 100)

        file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)

        # Load data and perform topic modeling
        documents = load_data(file_path)
        lda_model, corpus, dictionary = create_lda_model(documents, num_topics=num_topics)

        vis_data = visualize_topics(lda_model, corpus, dictionary)

        return jsonify({"html_content": vis_data}),200

    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error on the server
        return jsonify({"error": str(e)}), 500

@app.route('/sentiment_analysis', methods=['POST'])
def sentiment_analysis():
    data = request.json
    filename = data.get('filename')
    file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    # Load data and perform topic modeling
    documents = load_data_df(file_path)
    polarity_histogram,subjectivity_histogram,vader_pie_chart,emotion_pie_chart = handle_sentiments(documents)

    return jsonify({

        'polarity_histogram': json.loads(polarity_histogram),
        'subjectivity_histogram': json.loads(subjectivity_histogram),
        'vader_pie_chart': json.loads(vader_pie_chart),
        'emotion_pie_chart': json.loads(emotion_pie_chart)
    })

@app.route('/keyword_extraction', methods=['POST'])
def keyword_extraction():
    data = request.json
    filename = data.get('filename')
    top_n = data.get('top_n',25)
    if not filename:
        return jsonify({"error": "Filename not provided"}), 400

    file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    # Load data and perform topic modeling
    documents = load_data(file_path)

    
    top_keywords = extract_keywords_tfidf(documents,top_n=top_n)
    tfidf_figures = plot_tfidf_keywords(top_keywords, top_n=top_n)
    word2vec_figure = generate_word2vec_word_cloud(documents, top_n=top_n)

    results = {
        "tfidf_figures": json.loads(tfidf_figures),
        "word2vec_figure": json.loads(word2vec_figure)
    }

    return jsonify(results), 200

@app.route('/wordclouds', methods=['POST'])
def wordclouds_generate():
    data = request.json
    filename = data.get('filename')
    if not filename:
        return jsonify({"error": "Filename not provided"}), 400

    file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    
    # Load data and perform topic modeling
    df = load_data_df(file_path)

    # Generate the word cloud plots from the DataFrame for each label
    wordcloud_plots = generate_wordclouds_for_labels(df)

    results = {
        "wordcloud_plots":wordcloud_plots
    } 
    return jsonify(results), 200

@app.route('/histograms', methods=['POST'])
def text_statistics():
    data = request.json
    filename = data.get('filename')
    if not filename:
        return jsonify({"error": "Filename not provided"}), 400

    file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    
    # Load data into DataFrame
    df = load_data_df(file_path)

    # Check for timestamp column
    timestamp_col_names = ['Date', 'date', 'created_at']
    timestamp_col = get_column_name(df, timestamp_col_names)

    if timestamp_col is None:
        # If no timestamp column, only calculate text statistics
        character_count_fig, sentence_length_fig, word_count_fig = calculate_text_statistics(df)
        results = {
            "character_count_fig": character_count_fig,
            "sentence_length_fig": sentence_length_fig,
            "word_count_fig": word_count_fig,
        }
        return jsonify(results), 200

    # If timestamp column is found, calculate both text statistics and time series
    else:
        character_count_fig, sentence_length_fig, word_count_fig = calculate_text_statistics(df)
        time_series_fig = time_series_document_lengths(df)

        results = {
            "character_count_fig": character_count_fig,
            "sentence_length_fig": sentence_length_fig,
            "word_count_fig": word_count_fig,
            "time_series_fig": time_series_fig
        } 
        return jsonify(results), 200



if __name__ == '__main__':
    app.run(debug=True)
