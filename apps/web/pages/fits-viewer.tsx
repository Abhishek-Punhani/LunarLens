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
import MetadataViewer from "@/components/MetadataViewer";
import FilesList from "@/components/FilesList";
import { CLASSMetadata } from "@/types/class-data";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function FITSViewerPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fitsFiles, setFitsFiles] = useState<CLASSMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<CLASSMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = authService.isAuthenticated();
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  },[]);
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
      lstHr: header.cards?.["LST_HR"]?.value || 0,
      lstMin: header.cards?.["LST_MIN"]?.value || 0,
      lstSec: header.cards?.["LST_SEC"]?.value || 0,
      satLat: header.cards?.["SAT_LAT"]?.value || 0,
      satLon: header.cards?.["SAT_LON"]?.value || 0,
      satAlt: header.cards?.["SAT_ALT"]?.value || 0,
      boreLat:
        header.cards?.["BORE_LAT"]?.value ||
        header.cards?.["SAT_LAT"]?.value ||
        0,
      boreLon:
        header.cards?.["BORE_LON"]?.value ||
        header.cards?.["SAT_LON"]?.value ||
        0,
      exposure: header.cards?.["EXPOSURE"]?.value || 0,
      temp: header.cards?.["TEMP"]?.value || 0,
      gain: header.cards?.["GAIN"]?.value || 0,
      solarAng:
        header.cards?.["SOLARANG"]?.value ||
        header.cards?.["SOLAR_ANG"]?.value ||
        0,
      phaseAng:
        header.cards?.["PHASEANG"]?.value ||
        header.cards?.["PHASE_ANG"]?.value ||
        0,
      v0Lat: header.cards?.["V0_LAT"]?.value || 0,
      v0Lon: header.cards?.["V0_LON"]?.value || 0,
      v1Lat: header.cards?.["V1_LAT"]?.value || 0,
      v1Lon: header.cards?.["V1_LON"]?.value || 0,
      v2Lat: header.cards?.["V2_LAT"]?.value || 0,
      v2Lon: header.cards?.["V2_LON"]?.value || 0,
      v3Lat: header.cards?.["V3_LAT"]?.value || 0,
      v3Lon: header.cards?.["V3_LON"]?.value || 0,
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
        return new Promise<CLASSMetadata>((resolve, reject) => {
          try {
            const fits = new window.astro!.FITS(file, () => {
              const hdu = fits.getHDU();
              const header = hdu.header;
              console.log("Header for", file.name, ":", header);
              console.log("Header cards:", header.cards);
              console.log("SAT_LAT:", header.cards?.["SAT_LAT"]?.value);
              console.log("SAT_LON:", header.cards?.["SAT_LON"]?.value);
              const metadata = extractMetadata(header, file.name);
              console.log("Extracted metadata:", metadata);
              resolve({ ...metadata, id: `${Date.now()}-${file.name}` });
            });
          } catch (error) {
            reject(error);
          }
        });
      });

    try {
      const newFiles = await Promise.all(promises);
      setFitsFiles((prev) => [...prev, ...newFiles]);
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
              <p className="mt-3 text-sm text-blue-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                Processing FITS files...
              </p>
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
          </div>
          <div className="lg:col-span-3">
            <MetadataViewer metadata={selectedFile} />
          </div>
        </div>
      </main>
    </div>
  );
}
