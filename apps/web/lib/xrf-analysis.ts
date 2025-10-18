// filepath: /home/manav/dev_ws/lunarLens/frontend/lib/xrf-analysis.ts

// XRF Analysis utilities for CLASS data processing
// Based on the provided Python implementation, translated to TypeScript

export interface SpectrumData {
  TIME: number[];
  RATE: number[][];
}

export interface PeakData {
  timeOfOccurances: number[];
  timeCorrespondingPeakFlux: number[];
  maxPeakFlux: number;
  averagePeakFlux: number;
  riseTime: number[];
  left: number[];
  decayTime: number[];
  right: number[];
  prominences: number[];
  clusterLabels: number[];
  silhouetteAvg: number | null;
}

export interface ElementPeak {
  energy: number;
  counts: number;
  significance: number;
  element: string;
}

export interface XRFResult {
  detectedElements: ElementPeak[];
  fluxes: { [element: string]: number };
  ratios: { [ratio: string]: number };
}

// Element energy database (simplified, in keV)
const ELEMENT_ENERGIES: { [key: string]: number } = {
  Mg: 1.254, // Mg K-alpha
  Al: 1.487, // Al K-alpha
  Si: 1.74, // Si K-alpha
  Ca: 3.691, // Ca K-alpha
  Fe: 6.404, // Fe K-alpha
  // Add more as needed
};

// Smoothing function (5-point moving average)
export function smoothData(data: number[]): number[] {
  const smoothed = [...data];
  for (let i = 2; i < data.length - 2; i++) {
    smoothed[i] =
      (data[i - 2] + data[i - 1] + data[i] + data[i + 1] + data[i + 2]) / 5;
  }
  return smoothed;
}

// Simple peak detection (basic implementation)
export function findPeaks(
  data: number[],
  height: number = 350,
  distance: number = 500
): number[] {
  const peaks: number[] = [];
  for (let i = distance; i < data.length - distance; i++) {
    if (data[i] > height) {
      let isPeak = true;
      for (let j = 1; j <= distance; j++) {
        if (data[i] <= data[i - j] || data[i] <= data[i + j]) {
          isPeak = false;
          break;
        }
      }
      if (isPeak) {
        peaks.push(i);
        i += distance; // Skip ahead
      }
    }
  }
  return peaks;
}

// Calculate rise time
export function calculateRiseTime(
  data: number[],
  peaks: number[],
  time: number[]
): { riseTime: number[]; left: number[] } {
  const riseTime: number[] = [];
  const left: number[] = [];

  for (const peak of peaks) {
    let j = peak;
    while (j > 0 && data[j] - data[j - 1] >= -0.5) {
      j--;
    }
    left.push(j);
    riseTime.push(Math.abs(time[peak] - time[j]));
  }

  return { riseTime, left };
}

// Calculate decay time
export function calculateDecayTime(
  data: number[],
  peaks: number[],
  time: number[]
): { decayTime: number[]; right: number[] } {
  const decayTime: number[] = [];
  const right: number[] = [];

  for (const peak of peaks) {
    let j = peak;
    while (j < data.length - 1 && data[j] - data[j + 1] >= -0.5) {
      j++;
    }
    right.push(j);
    decayTime.push(Math.abs(time[peak] - time[j]));
  }

  return { decayTime, right };
}

// Calculate peak prominences (simplified)
export function calculateProminences(
  data: number[],
  peaks: number[]
): number[] {
  return peaks.map((peak) => {
    let leftMin = data[peak];
    let rightMin = data[peak];

    // Find left minimum
    for (let i = peak - 1; i >= 0; i--) {
      if (data[i] < leftMin) leftMin = data[i];
      else break;
    }

    // Find right minimum
    for (let i = peak + 1; i < data.length; i++) {
      if (data[i] < rightMin) rightMin = data[i];
      else break;
    }

    const minBase = Math.min(leftMin, rightMin);
    return data[peak] - minBase;
  });
}

// Simple clustering (basic k-means like approach for demonstration)
export function simpleClustering(features: number[][]): {
  labels: number[];
  silhouetteAvg: number | null;
} {
  // Simplified clustering - in production, use a proper ML library
  const labels = features.map(() => 0); // All same cluster for now
  return { labels, silhouetteAvg: null };
}

// Main processing function
export function processSpectrum(data: SpectrumData): PeakData {
  const smoothedRate = smoothData(data.RATE.flat());
  const peaks = findPeaks(smoothedRate);

  const { riseTime, left } = calculateRiseTime(smoothedRate, peaks, data.TIME);
  const { decayTime, right } = calculateDecayTime(
    smoothedRate,
    peaks,
    data.TIME
  );
  const prominences = calculateProminences(smoothedRate, peaks);

  const features = riseTime.map((rt, i) => [rt, decayTime[i], prominences[i]]);
  const { labels, silhouetteAvg } = simpleClustering(features);

  return {
    timeOfOccurances: peaks.map((i) => data.TIME[i]),
    timeCorrespondingPeakFlux: peaks.map((i) => smoothedRate[i]),
    maxPeakFlux: Math.max(...smoothedRate),
    averagePeakFlux:
      smoothedRate.reduce((a, b) => a + b, 0) / smoothedRate.length,
    riseTime,
    left,
    decayTime,
    right,
    prominences,
    clusterLabels: labels,
    silhouetteAvg,
  };
}

// Convert channel to energy (simplified calibration)
export function channelToEnergy(
  channel: number,
  gain: number = 0.01,
  offset: number = 0
): number {
  return channel * gain + offset;
}

// Identify element from energy
export function identifyElement(
  energy: number,
  tolerance: number = 0.1
): string | null {
  for (const [element, elemEnergy] of Object.entries(ELEMENT_ENERGIES)) {
    if (Math.abs(energy - elemEnergy) <= tolerance) {
      return element;
    }
  }
  return null;
}

// Calculate significance (signal-to-noise ratio)
export function calculateSignificance(
  signal: number,
  background: number
): number {
  if (background <= 0) return 0;
  return signal / Math.sqrt(background);
}

// Step 1: Identify spectra with XRF lines
export function identifyXRFPeaks(
  spectrum: number[],
  channels: number[],
  gain: number = 0.01
): ElementPeak[] {
  const peaks = findPeaks(spectrum);
  const detectedElements: ElementPeak[] = [];

  for (const peak of peaks) {
    const energy = channelToEnergy(channels[peak], gain);
    const element = identifyElement(energy);

    if (element) {
      // Calculate background (simplified as average of neighboring points)
      const backgroundStart = Math.max(0, peak - 10);
      const backgroundEnd = Math.min(spectrum.length, peak + 10);
      const background =
        spectrum
          .slice(backgroundStart, backgroundEnd)
          .reduce((a, b) => a + b, 0) /
        (backgroundEnd - backgroundStart);

      const significance = calculateSignificance(spectrum[peak], background);

      detectedElements.push({
        energy,
        counts: spectrum[peak],
        significance,
        element,
      });
    }
  }

  return detectedElements;
}

// Step 2: Model spectra to determine XRF line flux (simplified Gaussian fitting)
export function fitGaussian(
  x: number[],
  y: number[],
  peakIndex: number
): { amplitude: number; center: number; sigma: number } {
  // Simplified Gaussian fit - in production, use proper curve fitting
  const amplitude = y[peakIndex];
  const center = x[peakIndex];
  const sigma = 1; // Simplified

  return { amplitude, center, sigma };
}

export function calculateFlux(amplitude: number, sigma: number): number {
  // Integrate Gaussian: amplitude * sigma * sqrt(2*pi)
  return amplitude * sigma * Math.sqrt(2 * Math.PI);
}

// Step 3: Calculate ratios
export function calculateRatios(fluxes: { [element: string]: number }): {
  [ratio: string]: number;
} {
  const ratios: { [ratio: string]: number } = {};

  if (fluxes.Si) {
    if (fluxes.Mg) ratios["Mg/Si"] = fluxes.Mg / fluxes.Si;
    if (fluxes.Al) ratios["Al/Si"] = fluxes.Al / fluxes.Si;
    if (fluxes.Ca) ratios["Ca/Si"] = fluxes.Ca / fluxes.Si;
  }

  return ratios;
}

// Main XRF analysis function
export function analyzeXRFSpectrum(
  spectrum: number[],
  channels: number[]
): XRFResult {
  // Step 1: Identify XRF peaks
  const detectedElements = identifyXRFPeaks(spectrum, channels);

  // Step 2: Calculate fluxes
  const fluxes: { [element: string]: number } = {};
  for (const peak of detectedElements) {
    const peakIndex = channels.findIndex(
      (ch) => channelToEnergy(ch) === peak.energy
    );
    if (peakIndex >= 0) {
      const { amplitude, sigma } = fitGaussian(channels, spectrum, peakIndex);
      fluxes[peak.element] = calculateFlux(amplitude, sigma);
    }
  }

  // Step 3: Calculate ratios
  const ratios = calculateRatios(fluxes);

  return {
    detectedElements,
    fluxes,
    ratios,
  };
}
