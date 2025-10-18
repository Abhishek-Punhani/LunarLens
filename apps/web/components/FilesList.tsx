import { CLASSMetadata } from "@/types/class-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin } from "lucide-react";

interface FilesListProps {
  files: CLASSMetadata[];
  selectedFile: CLASSMetadata | null;
  onFileSelect: (file: CLASSMetadata) => void;
}

export default function FilesList({
  files,
  selectedFile,
  onFileSelect,
}: FilesListProps) {
  return (
    <Card className="h-full bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-white">CLASS Files</span>
          <span className="text-sm font-normal text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {files.length} files
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-3">
            {files.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg">No files uploaded yet</p>
                <p className="text-sm mt-2">Upload FITS files to get started</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onFileSelect(file)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200  hover:shadow-lg ${
                    selectedFile?.id === file.id
                      ? "bg-blue-600/20 border-blue-500 shadow-blue-500/20"
                      : "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate mb-2">
                        {file.filename}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-gray-300">
                          {file.boreLat.toFixed(2)}°, {file.boreLon.toFixed(2)}°
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Dataset {file.dataset}
                        </p>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
