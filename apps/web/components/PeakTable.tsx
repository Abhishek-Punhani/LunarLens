// filepath: /home/manav/dev_ws/lunarLens/apps/web/components/PeakTable.tsx
import { AnalysisResult } from "@/services/calcService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PeakTableProps {
  result: AnalysisResult;
}

export default function PeakTable({ result }: PeakTableProps) {
  const peaks = result.elements
    .map((element, idx) => ({
      element,
      energy: result.peaks[idx]?.toFixed(2) || "N/A",
      flux: result.fluxes[element]?.toFixed(2) || "N/A",
      significance: result.significances[element]?.toFixed(2) || "N/A",
    }))
    .filter((peak) => peak.element);

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Detected Peaks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Element</TableHead>
              <TableHead className="text-gray-300">Energy (keV)</TableHead>
              <TableHead className="text-gray-300">Flux</TableHead>
              <TableHead className="text-gray-300">Significance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peaks.map((peak, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{peak.element}</TableCell>
                <TableCell>{peak.energy}</TableCell>
                <TableCell>{peak.flux}</TableCell>
                <TableCell>{peak.significance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
