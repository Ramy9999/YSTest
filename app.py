from flask import Flask, send_from_directory, request, jsonify, render_template
from flask_cors import CORS
import os
import whisper
import logging
import openai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # This will enable CORS for all routes

openai_api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = openai_api_key

logging.basicConfig(level=logging.INFO)
model = whisper.load_model("base")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>')
def serve_page(path):
    if path.endswith('.html'):
        return render_template(path)
    else:
        return send_from_directory('static', path)

def get_text(file_path):
    if file_path is not None:
        output_text_transcribe = ''

        file_stats = os.stat(file_path)
        logging.info(f'Size of audio file in Bytes: {file_stats.st_size}')

        if file_stats.st_size <= 30000000:  # Check if file size is within the limit
            result = model.transcribe(file_path)
            return result['text'].strip()
        else:
            logging.error('Videos for transcription on this space are limited to about 1.5 hours. Sorry about this limit but some joker thought they could stop this tool from working by transcribing many extremely long videos. Please visit https://steve.digital to contact me about this space.')
    else:
        raise ValueError("No file path provided.")

def get_chatgpt_response(text):
    max_retries = 5
    retries = 0
    delay = 2  # Start with 2 seconds delay

    while retries < max_retries:
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Rate me as a job candidate and give me a score from 1 to 10."},
                    {"role": "user", "content": text}
                ]
            )
            return response.choices[0].message.content.strip()
        except openai.error.RateLimitError as e:
            retries += 1
            print(f"RateLimitError: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
            delay *= 2  # Exponential backoff
        except openai.error.OpenAIError as e:
            print(f"OpenAI API error: {e}")
            break
    return "Failed to get response from ChatGPT after several retries."

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file = request.files['file']
    file_path = os.path.join("temp", file.filename)
    file.save(file_path)
    
    try:
        text = get_text(file_path)
        chatgpt_response = get_chatgpt_response(text)
        return jsonify({'message': 'Transcription complete.', 'output': text, 'chatgpt_response': chatgpt_response})
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        return jsonify({'message': 'Transcription failed.', 'error': str(e)}), 500
    finally:
        os.remove(file_path)  # Clean up the temporary file

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)