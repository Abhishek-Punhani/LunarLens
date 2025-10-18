// filepath: /home/manav/dev_ws/lunarLens/apps/web/components/RatioChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RatioChartProps {
  ratios: { [key: string]: number };
}

export default function RatioChart({ ratios }: RatioChartProps) {
  const data = Object.entries(ratios).map(([key, value]) => ({
    ratio: key,
    value: value.toFixed(3),
  }));

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Elemental Ratios</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="ratio" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-400 mt-2">
          Ratios relative to Silicon (Si)
        </p>
      </CardContent>
    </Card>
  );
}
