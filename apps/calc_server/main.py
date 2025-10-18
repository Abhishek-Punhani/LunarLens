from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from utils import analyze_spectrum, process_flare_data

app = FastAPI()

# Allow local frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SpectrumData(BaseModel):
    channel: List[int]
    counts: List[int]
    gain: float  # eV/channel
    sat_lat: float
    sat_lon: float
    # Add more metadata fields as needed


class FlareData(BaseModel):
    TIME: List[float]
    RATE: List[float]


class PredictRequest(BaseModel):
    lat: float
    lon: float


@app.post("/analyze_spectrum")
async def analyze_spectrum(data: SpectrumData):
    result = analyze_spectrum(
        data.channel, data.counts, data.gain, data.sat_lat, data.sat_lon
    )
    return JSONResponse(result)


@app.post("/detect_flares")
async def detect_flares(data: FlareData):
    # Convert to numpy arrays for processing
    Data = {
        "TIME": np.array(data.TIME),
        "RATE": np.array(data.RATE)
    }
    result = process_flare_data(Data)
    return JSONResponse(result)


@app.get("/")
def read_root():
    return {"message": "Calc Server is running!"}
