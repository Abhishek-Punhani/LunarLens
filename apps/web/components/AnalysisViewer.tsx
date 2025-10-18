// filepath: /home/manav/dev_ws/lunarLens/apps/web/components/AnalysisViewer.tsx
import { AnalysisResult } from "@/services/calcService";
import SpectralPlot from "./SpectralPlot";
import RatioChart from "./RatioChart";
import PeakTable from "./PeakTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisViewerProps {
  result: AnalysisResult | null;
}

export default function AnalysisViewer({ result }: AnalysisViewerProps) {
  if (!result) {
    return (
      <Card className="h-full bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg">XRF Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-12">
            <p>Select a FITS file to view analysis results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>XRF Analysis Results</span>
            <Badge variant="secondary" className="bg-blue-600">
              {result.elements.filter((e) => e).length} Elements Detected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400">Latitude</p>
              <p className="text-lg font-semibold">
                {result.mapped.latitude.toFixed(2)}°
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Longitude</p>
              <p className="text-lg font-semibold">
                {result.mapped.longitude.toFixed(2)}°
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SpectralPlot result={result} />
      <RatioChart ratios={result.ratios} />
      <PeakTable result={result} />
    </div>
  );
}
