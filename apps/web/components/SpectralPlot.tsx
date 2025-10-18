// filepath: /home/manav/dev_ws/lunarLens/apps/web/components/SpectralPlot.tsx
import { AnalysisResult } from "@/services/calcService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpectralPlotProps {
  result: AnalysisResult;
}

export default function SpectralPlot({ result }: SpectralPlotProps) {
  const chartData = result.spectrum.channels.map((ch, idx) => ({
    channel: ch,
    energy: result.spectrum.energies[idx].toFixed(2),
    counts: result.spectrum.counts[idx],
  }));

  // Mark peaks
  const peakData = result.peaks.map((energy, idx) => ({
    energy: energy.toFixed(2),
    counts: result.spectrum.counts[result.peaks.indexOf(energy)] || 0,
    element: result.elements[idx] || "Unknown",
  }));

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">XRF Spectrum</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="energy"
              stroke="#9CA3AF"
              label={{
                value: "Energy (keV)",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              label={{ value: "Counts", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelFormatter={(value: string) => `Energy: ${value} keV`}
            />
            <Line
              type="monotone"
              dataKey="counts"
              stroke="#3B82F6"
              strokeWidth={1}
              dot={false}
            />
            {/* Mark peaks */}
            {peakData.map((peak, idx) => (
              <Line
                key={idx}
                type="monotone"
                data={[peak]}
                dataKey="counts"
                stroke="#EF4444"
                strokeWidth={0}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <p className="text-sm text-gray-400">Detected Elements:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {peakData.map((peak, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-red-400 border-red-400"
              >
                {peak.element} ({peak.energy} keV)
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
