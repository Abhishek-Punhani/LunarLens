export interface CLASSMetadata {
  id?: string;
  filename: string;
  dataset: string;
  startTime: string;
  endTime: string;
  lstHr: number;
  lstMin: number;
  lstSec: number;
  satLat: number;
  satLon: number;
  satAlt: number;
  boreLat: number;
  boreLon: number;
  exposure: number;
  temp: number;
  gain: number;
  solarAng: number;
  phaseAng: number;
  v0Lat: number;
  v0Lon: number;
  v1Lat: number;
  v1Lon: number;
  v2Lat: number;
  v2Lon: number;
  v3Lat: number;
  v3Lon: number;
  file?: File;
}

export interface PeakData {
  channel: number;
  energy: number;
  element: string;
  flux: number;
  significance: number;
}

export interface SpectrumData {
  channels: number[];
  counts: number[];
}

export type RatiosData = {
  [key: string]: number;
};

export interface AnalysisResponse {
  lat: number;
  lon: number;
  spectrum: SpectrumData;
  peaks: PeakData[];
  ratios: RatiosData;
}
