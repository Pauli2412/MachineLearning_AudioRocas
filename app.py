from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import soundfile as sf
import librosa
import openl3
import os

app = Flask(__name__)
CORS(app)

# Cargar el modelo entrenado
model_path = 'trained_classifier.pkl'
model = joblib.load(model_path)

def extract_features(audio_path, sr=48000):
    audio, sample_rate = sf.read(audio_path)
    if sample_rate != sr:
        audio = librosa.resample(audio, sample_rate, sr)
    features, timestamps = openl3.get_audio_embedding(audio, sr, content_type='music')
    return features

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)
    
    features = extract_features(file_path)
    features_mean = np.mean(features, axis=0).reshape(1, -1)
    prediction = model.predict(features_mean)
    result = "Buen Estado" if prediction == 1 else "Mal Estado"
    
    return jsonify({"prediction": result, "features": features_mean.tolist()})

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(host='0.0.0.0', port=5000)

