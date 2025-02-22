from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request

from pydantic import BaseModel

from datetime import datetime
import os
import requests
import uvicorn
from pathlib import Path
from io import BytesIO

import tensorflow as tf
import tf_keras as keras
import numpy as np
from transformers import BertTokenizer, TFAutoModelForSequenceClassification
from tensorflow.keras.preprocessing import image
import speech_recognition as sr
from dotenv import load_dotenv

load_dotenv()
os.getenv("PORT", 8000)

# Load model paths from environment variables with fallback defaults
WASTE_CLASSIFIER_PATH = os.getenv("WASTE_CLASSIFIER_PATH", "waste_classifier.keras")
BERT_MODEL_PATH = os.getenv("BERT_MODEL_PATH", "bert_waste_classifier")

class TextRequest(BaseModel):
    text: str

# Initialize FastAPI App
app = FastAPI()

# Create results directory if not exists
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

# Serve uploaded images as static files
app.mount("/results", StaticFiles(directory="results"), name="results")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI Image Classification Model
image_model = tf.keras.models.load_model(WASTE_CLASSIFIER_PATH)
CLASS_NAMES = ["Recyclable", "Non-Recyclable", "Biodegradable"]

DISPOSAL_GUIDELINES = {
    "Recyclable": "Place in the recycling bin. Clean before disposal.",
    "Non-Recyclable": "Dispose in general waste. Avoid contamination with recyclables.",
    "Biodegradable": "Compost or use an organic waste bin. Suitable for natural decomposition.",
}

# Load BERT Text Classification Model
bert_tokenizer = BertTokenizer.from_pretrained(BERT_MODEL_PATH)
# Load BERT Model (TensorFlow version)
bert_model = TFAutoModelForSequenceClassification.from_pretrained(BERT_MODEL_PATH)

LABEL_MAP = {0: "Recyclable", 1: "Non-Recyclable", 2: "Biodegradable"}

# Function to classify waste from image
async def predict_waste(contents: bytes):
    try:
        img = image.load_img(BytesIO(contents), target_size=(224, 224))  
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = image_model.predict(img_array)
        class_index = np.argmax(prediction)
        confidence = round(float(np.max(prediction)), 2) * 100

        category = CLASS_NAMES[class_index]
        disposal_guidance = DISPOSAL_GUIDELINES[category]

        return category, confidence, disposal_guidance
    except Exception as e:
        return "Error", 0.0, str(e)
'''
async def get_city_from_coordinates(lat: str, lon: str):
    url = f"https://geocoding-api.open-meteo.com/v1/reverse?latitude={lat}&longitude={lon}&format=json"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if "results" in data and len(data["results"]) > 0:
            return data["results"][0].get("name", "Unknown Location")
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching location data: {e}")
        return "Unknown Location"

    return "Unknown Location"

'''
async def get_city_from_coordinates(lat: str, lon: str):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    
    headers = {"User-Agent": "MyApp (prash272005@gmail.com)"}
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if "address" in data:
            return data["address"].get("city", data["address"].get("town", "Unknown Location"))
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching location data: {e}")
        return "Unknown Location"

    return "Unknown Location"


# Function to classify waste from text using TensorFlow
async def classify_text_waste(text: str):
    inputs = bert_tokenizer(text, return_tensors="tf", padding=True, truncation=True, max_length=128)

    outputs = bert_model(**inputs)
    logits = outputs.logits.numpy()  # Convert TensorFlow tensor to NumPy
    prediction = np.argmax(logits, axis=1)[0]  # Get the predicted label index

    return LABEL_MAP[prediction]


# Function to convert voice to text
async def speech_to_text(audio_file: UploadFile):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file.file) as source:
        audio = recognizer.record(source)
    return recognizer.recognize_google(audio)

# API Endpoint for Image Classification
@app.post("/classify")
async def classify_waste(request: Request, file: UploadFile = File(...), lat: str = Form(...), lon: str = Form(...)):
    city = await get_city_from_coordinates(lat, lon)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = RESULTS_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    with open(file_path, "rb") as img_file:
        contents = img_file.read()

    category, confidence, guidance = await predict_waste(contents)
    host_url = str(request.base_url)
    image_url = f"{host_url}results/{filename}"


    category, confidence, guidance = await predict_waste(contents)

    return {
        "predicted_category": category,
        "confidence": round(confidence, 2),
        "guidance": guidance,
        "detected_city": city,
        "image_url": image_url,
    }

# API Endpoint for Text-Based Classification
@app.post("/classify_text")
async def classify_text(request: TextRequest):
    category = await classify_text_waste(request.text)
    return {"input_text": request.text, "predicted_category": category}

# API Endpoint for Voice-Based Classification
@app.post("/classify_voice")
async def classify_voice(audio: UploadFile = File(...), lat: str = Form(...), lon: str = Form(...)):
    try:
        # Convert voice to text
        text = await speech_to_text(audio)

        # Get city from coordinates
        city = await get_city_from_coordinates(lat, lon)

        # Classify text waste and get additional details
        classification_result = await classify_text_waste(text)

        return {
            "recognized_text": text,
            "predicted_category": classification_result.get("category", "Unknown"),
            "guidance": classification_result.get("guidance", "No guidance available"),
            "detected_city": city
        }
    except Exception as e:
        return {"error": str(e)}
    
# Run Server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)