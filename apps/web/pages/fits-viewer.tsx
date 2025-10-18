"use client";
declare global {
  interface Window {
    astro?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FITS?: any;
    };
  }
}

import { useEffect, useRef, useState } from "react";
import { Satellite } from "lucide-react";
import LunarGlobe from "@/components/LunarGlobe";
import FilesList from "@/components/FilesList";
import MetadataViewer from "@/components/MetadataViewer";
import { CLASSMetadata } from "@/types/class-data";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { calcService, AnalysisResult } from "@/services/calcService";
import AnalysisViewer from "@/components/AnalysisViewer";

export default function FITSViewerPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fitsFiles, setFitsFiles] = useState<CLASSMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<CLASSMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [combinedResult, setCombinedResult] = useState<AnalysisResult | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = authService.isAuthenticated();
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  }, [router]);

  // Load astro FITS library dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/fits.js";
    script.onload = () => {
      if (window.astro && window.astro.FITS) {
        console.log("astro.FITS loaded and ready");
      } else {
        console.error("astro.FITS is not available");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const extractMetadata = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    header: any,
    filename: string
  ): CLASSMetadata => {
    return {
      filename,
      dataset: filename.split("_")[0] || "Unknown",
      startTime:
        header.cards?.["STARTIME"]?.value ||
        header.cards?.["START_TIM"]?.value ||
        "",
      endTime:
        header.cards?.["ENDTIME"]?.value ||
        header.cards?.["END_TIM"]?.value ||
        "",
      lstHr: parseFloat(header.cards?.["LST_HR"]?.value) || 0,
      lstMin: parseFloat(header.cards?.["LST_MIN"]?.value) || 0,
      lstSec: parseFloat(header.cards?.["LST_SEC"]?.value) || 0,
      satLat: parseFloat(header.cards?.["SAT_LAT"]?.value) || 0,
      satLon: parseFloat(header.cards?.["SAT_LON"]?.value) || 0,
      satAlt: parseFloat(header.cards?.["SAT_ALT"]?.value) || 0,
      boreLat:
        parseFloat(header.cards?.["BORE_LAT"]?.value) ||
        parseFloat(header.cards?.["SAT_LAT"]?.value) ||
        0,
      boreLon:
        parseFloat(header.cards?.["BORE_LON"]?.value) ||
        parseFloat(header.cards?.["SAT_LON"]?.value) ||
        0,
      exposure: parseFloat(header.cards?.["EXPOSURE"]?.value) || 0,
      temp: parseFloat(header.cards?.["TEMP"]?.value) || 0,
      gain: parseFloat(header.cards?.["GAIN"]?.value) || 0,
      solarAng:
        parseFloat(header.cards?.["SOLARANG"]?.value) ||
        parseFloat(header.cards?.["SOLAR_ANG"]?.value) ||
        0,
      phaseAng:
        parseFloat(header.cards?.["PHASEANG"]?.value) ||
        parseFloat(header.cards?.["PHASE_ANG"]?.value) ||
        0,
      v0Lat: parseFloat(header.cards?.["V0_LAT"]?.value) || 0,
      v0Lon: parseFloat(header.cards?.["V0_LON"]?.value) || 0,
      v1Lat: parseFloat(header.cards?.["V1_LAT"]?.value) || 0,
      v1Lon: parseFloat(header.cards?.["V1_LON"]?.value) || 0,
      v2Lat: parseFloat(header.cards?.["V2_LAT"]?.value) || 0,
      v2Lon: parseFloat(header.cards?.["V2_LON"]?.value) || 0,
      v3Lat: parseFloat(header.cards?.["V3_LAT"]?.value) || 0,
      v3Lon: parseFloat(header.cards?.["V3_LON"]?.value) || 0,
    };
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || !window.astro?.FITS) return;

    setIsLoading(true);

    const promises = Array.from(files)
      .filter((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        return extension === "fits" || extension === "fit";
      })
      .map((file) => {
        return new Promise<{
          metadata: CLASSMetadata;
          spectrum: { channel: number[]; counts: number[] };
        }>((resolve, reject) => {
          try {
            const fits = new window.astro!.FITS(file, () => {
              const hdu = fits.getHDU();
              console.log(hdu);
              const header = hdu.header;
              console.log("Header for", file.name, ":", header);
              console.log("Header cards:", header.cards);
              console.log("SAT_LAT:", header.cards?.["SAT_LAT"]?.value);
              console.log("SAT_LON:", header.cards?.["SAT_LON"]?.value);
              const metadata = extractMetadata(header, file.name);
              console.log("Extracted metadata:", metadata);
              const data = hdu.data;
              if (!data) return reject(new Error("No data"));
              let channels: number[];
              let counts: number[];

              console.log("Data type:", typeof data);
              console.log("Data keys:", Object.keys(data));
              console.log("Data rows:", data.rows);
              console.log("Data columns:", data.columns);
              console.log("Data accessors:", data.accessors);

              // Check if it's a BinaryTable with column data
              if (data.rows && typeof data.rows === "number" && data.rows > 0) {
                // BinaryTable - read directly from blob
                try {
                  channels = [];
                  counts = [];

                  console.log("Reading BinaryTable with", data.rows, "rows");
                  console.log("Row byte size:", data.rowByteSize);
                  console.log("Element byte lengths:", data.elementByteLengths);

                  // Read the blob data directly
                  const blob = data.blob;
                  const reader = new FileReader();

                  reader.onload = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const dataView = new DataView(arrayBuffer);

                    // Each row is 6 bytes: 2 bytes (Int16) for CHANNEL + 4 bytes (Float32) for COUNTS
                    for (let i = 0; i < data.rows; i++) {
                      const offset = i * data.rowByteSize;
                      // Read CHANNEL (Int16, 2 bytes, big-endian)
                      const channelValue = dataView.getInt16(offset, false);
                      // Read COUNTS (Float32, 4 bytes, big-endian)
                      const countsValue = dataView.getFloat32(
                        offset + 2,
                        false
                      );
                      channels.push(channelValue);
                      counts.push(countsValue);
                    }

                    console.log(
                      "Successfully read",
                      channels.length,
                      "channels"
                    );
                    console.log("First 5 channels:", channels.slice(0, 5));
                    console.log("First 5 counts:", counts.slice(0, 5));
                    console.log("Last 5 channels:", channels.slice(-5));
                    console.log("Last 5 counts:", counts.slice(-5));

                    resolve({
                      metadata: {
                        ...metadata,
                        id: `${Date.now()}-${file.name}`,
                        file,
                      },
                      spectrum: { channel: channels, counts },
                    });
                  };

                  reader.onerror = () => {
                    console.error("Error reading blob");
                    reject(new Error("Failed to read FITS data blob"));
                  };

                  reader.readAsArrayBuffer(blob);
                  return; // Exit early, reader.onload will handle resolve
                } catch (e) {
                  console.error("Error reading BinaryTable:", e);
                  // Fallback to empty arrays
                  channels = [];
                  counts = [];
                }
              } else if (Array.isArray(data)) {
                // Direct array data
                console.log("Data is array, length:", data.length);
                counts = data.map((c: number | null | undefined) =>
                  c == null || isNaN(c) ? 0 : c
                );
                channels = counts.map((_, i) => i);
              } else {
                // Assume 1D array or 2D image data
                let countsArray: number[];
                if (
                  Array.isArray(data) &&
                  data.length > 0 &&
                  Array.isArray(data[0])
                ) {
                  countsArray = (data as number[][]).flat();
                } else {
                  countsArray = Array.from(data as Iterable<number>);
                }
                counts = countsArray.map((c) =>
                  c == null || isNaN(c) ? 0 : c
                );
                channels = counts.map((_, i) => i);
              }
              resolve({
                metadata: {
                  ...metadata,
                  id: `${Date.now()}-${file.name}`,
                  file,
                },
                spectrum: { channel: channels, counts },
              });
            });
          } catch (error) {
            reject(error);
          }
        });
      });

    try {
      const results = await Promise.all(promises);
      const newFiles: CLASSMetadata[] = results.map((r) => r.metadata);
      setFitsFiles((prev) => [...prev, ...newFiles]);
      // Compute combined
      if (results.length > 0) {
        const allChannels = results[0].spectrum.channel; // assume same
        const numChannels = allChannels.length;
        const summedCounts = new Array(numChannels).fill(0);
        let totalLat = 0,
          totalLon = 0,
          totalGain = 0;
        results.forEach(({ metadata, spectrum }) => {
          spectrum.counts.forEach((c, i) => (summedCounts[i] += c));
          totalLat += metadata.satLat;
          totalLon += metadata.satLon;
          totalGain += metadata.gain;
        });
        const avgCounts = summedCounts.map((s) => s / results.length);
        const avgLat = totalLat / results.length;
        const avgLon = totalLon / results.length;
        const avgGain = totalGain / results.length;
        const combinedResult = await calcService.analyzeSpectrum({
          channel: allChannels,
          counts: avgCounts,
          gain: avgGain,
          sat_lat: avgLat,
          sat_lon: avgLon,
        });
        setCombinedResult(combinedResult);
      }
    } catch (error) {
      console.error("Error parsing FITS files:", error);
    } finally {
      setIsLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload FITS Files
            </label>
            <input
              type="file"
              ref={fileInput}
              multiple
              accept=".fits,.fit"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={isLoading}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 transition-all duration-200"
            />
            {isLoading && (
              <div className="mt-3 text-sm text-blue-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                Processing FITS files...
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-pulse">
              <Satellite className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <p className="text-lg">Analyzing astronomical data...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <FilesList
              files={fitsFiles}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>
          <div className="lg:col-span-6">
            <div className="h-[700px] bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <LunarGlobe
                classFiles={fitsFiles}
                onMarkerClick={setSelectedFile}
              />
            </div>
            <div className="mt-8">
              <AnalysisViewer result={combinedResult} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <MetadataViewer metadata={selectedFile} />
          </div>
        </div>
      </main>
    </div>
  );
}
