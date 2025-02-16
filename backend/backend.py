
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import jwt
import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from pathlib import Path
from datetime import datetime
import tensorflow as tf
import numpy as np
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from tensorflow.keras.preprocessing import image
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import uvicorn
from PIL import Image  
from io import BytesIO
import speech_recognition as sr
from fastapi.staticfiles import StaticFiles

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
image_model = tf.keras.models.load_model("waste_classifier.keras")
CLASS_NAMES = ["Recyclable", "Non-Recyclable", "Biodegradable"]

DISPOSAL_GUIDELINES = {
    "Recyclable": "Place in the recycling bin. Clean before disposal.",
    "Non-Recyclable": "Dispose in general waste. Avoid contamination with recyclables.",
    "Biodegradable": "Compost or use an organic waste bin. Suitable for natural decomposition.",
}

# Load BERT Text Classification Model
BERT_MODEL_PATH = "bert_waste_classifier"
bert_tokenizer = BertTokenizer.from_pretrained(BERT_MODEL_PATH)
bert_model = BertForSequenceClassification.from_pretrained(BERT_MODEL_PATH)

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

# Function to classify waste from text
async def classify_text_waste(text: str):
    inputs = bert_tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)

    with torch.no_grad():
        logits = bert_model(**inputs).logits
        prediction = torch.argmax(logits, dim=1).item()

    return LABEL_MAP[prediction]

# Function to convert voice to text
async def speech_to_text(audio_file: UploadFile):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file.file) as source:
        audio = recognizer.record(source)
    return recognizer.recognize_google(audio)

# API Endpoint for Image Classification
@app.post("/classify")
async def classify_waste(file: UploadFile = File(...), lat: str = Form(...), lon: str = Form(...)):
    city = await get_city_from_coordinates(lat, lon)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = RESULTS_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    with open(file_path, "rb") as img_file:
        contents = img_file.read()

    category, confidence, guidance = await predict_waste(contents)

    return {
        "predicted_category": category,
        "confidence": round(confidence, 2),
        "guidance": guidance,
        "detected_city": city,
        "image_url": f"http://127.0.0.1:8000/results/{filename}",
    }

# API Endpoint for Text-Based Classification
@app.get("/classify_text")
async def classify_text(text: str):
    category = await classify_text_waste(text)
    return {"input_text": text, "predicted_category": category}

# API Endpoint for Voice-Based Classification
@app.get("/classify_voice")
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
    
'''
# Signin and Signup

# Secret key for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# User Model
class User(Base):
    _tablename_ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Signup Route
@app.post("/signup/")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    new_user = User(name=user.name, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Signup successful"}

# Login Route
@app.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token_data = {"sub": user.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": access_token}
'''
    
# Run Server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)