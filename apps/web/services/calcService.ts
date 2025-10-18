import axios from "axios";

const calcApi = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SpectrumData {
  channel: number[];
  counts: number[];
  gain: number;
  sat_lat: number;
  sat_lon: number;
}

export interface AnalysisResult {
  peaks: number[];
  elements: string[];
  significances: { [key: string]: number };
  fluxes: { [key: string]: number };
  ratios: { [key: string]: number };
  mapped: {
    latitude: number;
    longitude: number;
    ratios: { [key: string]: number };
  };
  spectrum: {
    channels: number[];
    counts: number[];
    energies: number[];
  };
}

export interface MapResult {
  grid_lats: number[][];
  grid_lons: number[][];
  predicted_ratios: { [key: string]: number[][] };
}

export const calcService = {
  analyzeSpectrum: async (data: SpectrumData): Promise<AnalysisResult> => {
    const response = await calcApi.post("/analyze_spectrum", data);
    return response.data;
  },

  generateMap: async (): Promise<MapResult> => {
    const response = await calcApi.get("/generate_map");
    return response.data;
  },

  clearData: async (): Promise<{ message: string }> => {
    const response = await calcApi.post("/clear_data");
    return response.data;
  },
};
