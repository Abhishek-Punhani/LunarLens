import { CLASSMetadata } from "../types/class-data";
import { Badge } from "./ui/badge";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MetadataViewerProps {
  metadata: CLASSMetadata | null;
}

export default function MetadataViewer({ metadata }: MetadataViewerProps) {
  if (!metadata) {
    return (
      <Card className="h-full bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Observation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg">No observation selected</p>
            <p className="text-sm mt-2">
              Click on a marker or file to view details
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gray-800 border-gray-700 text-white overflow-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-white">Observation Details</span>
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-400 bg-blue-500/10"
          >
            Dataset {metadata.dataset}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-400 font-mono bg-gray-900 p-2 rounded">
          {(() => {
            const half = Math.ceil(metadata.filename.length / 2);
            const firstLine = metadata.filename.slice(0, half);
            const secondLine = metadata.filename.slice(half);
            return (
              <>
          {firstLine}
          <br />
          {secondLine}
              </>
            );
          })()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Time Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Start Time:</span>
              <span className="text-white font-mono">{metadata.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">End Time:</span>
              <span className="text-white font-mono">{metadata.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Local Solar Time:</span>
              <span className="text-white font-mono">
                {metadata.lstHr}:{metadata.lstMin.toString().padStart(2, "0")}:
                {metadata.lstSec.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-green-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Satellite Position
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Latitude:</span>
              <span className="text-white">{metadata.satLat.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longitude:</span>
              <span className="text-white">{metadata.satLon.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Altitude:</span>
              <span className="text-white">
                {metadata.satAlt.toFixed(2)} km
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-purple-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Boresight Position
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Latitude:</span>
              <span className="text-white font-semibold">
                {metadata.boreLat.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longitude:</span>
              <span className="text-white font-semibold">
                {metadata.boreLon.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-orange-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            Observation Parameters
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Exposure:</span>
              <span className="text-white">
                {metadata.exposure.toFixed(3)} s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Temperature:</span>
              <span className="text-white">{metadata.temp.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gain:</span>
              <span className="text-white">
                {metadata.gain.toFixed(1)} eV/channel
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Solar Angle:</span>
              <span className="text-white">
                {metadata.solarAng.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phase Angle:</span>
              <span className="text-white">
                {metadata.phaseAng.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-red-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Pixel Corner Coordinates
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">V0:</span>{" "}
              <span className="text-white">
                {metadata.v0Lat.toFixed(2)}°, {metadata.v0Lon.toFixed(2)}°
              </span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">V1:</span>{" "}
              <span className="text-white">
                {metadata.v1Lat.toFixed(2)}°, {metadata.v1Lon.toFixed(2)}°
              </span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">V2:</span>{" "}
              <span className="text-white">
                {metadata.v2Lat.toFixed(2)}°, {metadata.v2Lon.toFixed(2)}°
              </span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-gray-400">V3:</span>{" "}
              <span className="text-white">
                {metadata.v3Lat.toFixed(2)}°, {metadata.v3Lon.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
