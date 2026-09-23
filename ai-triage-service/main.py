from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib

#initialize the FastAPI app
app = FastAPI(title = "Triage AI Microservice")

#load trained model into memory when server starts
try:
    pipeline = joblib.load("triage_model.pkl")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
# define stracture of the data that will be sent from Express.js(like a typescript interface)
class TriageRequest(BaseModel):
    age: int
    pain_level: int
    temperature: float
    blood_pressure_sys: int
    blood_pressure_dia: int
    heart_rate: int
    chief_complaint: str

# POST route to receive data from Express.js and return the AI priority
@app.post("/api/v1/predict-triage")
def predict_triage(request: TriageRequest):
    try:
        # Convert the incoming JSON data into a PandasDataFrame
        input_data = pd.DataFrame([{
            'age': request.age,
            'pain_level': request.pain_level,
            'temperature': request.temperature,
            'blood_pressure_sys': request.blood_pressure_sys,
            'blood_pressure_dia': request.blood_pressure_dia,
            'heart_rate': request.heart_rate,
            'chief_complaint': request.chief_complaint
        }])
        
        # Make prediction using the loaded model
        prediction = pipeline.predict(input_data)

        # The model returns an array like [1], so we grab the first item and make it a standard integer
        priority_score = int(prediction[0])
        
        # Return the prediction as a JSON response
        return {"triage_priority": priority_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {e}")