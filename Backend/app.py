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
    # Load your text data from the file (you'll need to implement this)
    text_data = ["Sample text 1", "Sample text 2", "Sample text 3"]  # Replace with actual text loading logic

    # Perform analysis on each text
    analysis_results = []
    for text in text_data:
        textblob_result = analyze_textblob(text)
        vader_result = analyze_vader(text)
        emotion_result = analyze_emotions(text)
        analysis_results.append({
            'text': text,
            'textblob': textblob_result,
            'vader': vader_result,
            'emotions': emotion_result
        })

    # Extract data for visualizations
    polarity_data = [result['textblob']['polarity'] for result in analysis_results]
    subjectivity_data = [result['textblob']['subjectivity'] for result in analysis_results]
    vader_data = [result['vader'] for result in analysis_results]
    emotion_data = [result['emotions'] for result in analysis_results]

    # Create visualizations
    polarity_histogram = create_polarity_histogram(polarity_data)
    subjectivity_histogram = create_subjectivity_histogram(subjectivity_data)
    vader_pie_chart = create_vader_pie_chart(vader_data)
    emotion_pie_chart = create_emotion_pie_chart(emotion_data)

    return jsonify({
        'polarity_histogram': json.loads(polarity_histogram),
        'subjectivity_histogram': json.loads(subjectivity_histogram),
        'vader_pie_chart': json.loads(vader_pie_chart),
        'emotion_pie_chart': json.loads(emotion_pie_chart)
    })

if __name__ == '__main__':
    app.run(debug=True)
