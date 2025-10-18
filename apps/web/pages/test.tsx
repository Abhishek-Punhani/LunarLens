"use client";
import { useEffect, useRef, useState } from "react";

export default function TestPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<any>(null);

  // Load astro FITS library dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/fits.js"; // make sure fits.js is in your public/ folder
    script.onload = () => {
      if ((window as any).astro && (window as any).astro.FITS) {
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

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "lc" || extension === "fits") {
      if ((window as any).astro?.FITS) {
        const fits = new (window as any).astro.FITS(file, () => {
          // Get the first HDU (Header Data Unit)
          const hdu = fits.getHDU();
          // Extract header and data
          const header = hdu.header;
          const imageData = hdu.data;
          let parsedContent: any = { header, imageData };

          // If it's a table, try to extract rows
          try {
            const table = fits.getDataUnit(1);
            if (table && typeof table.getRows === "function") {
              table.getRows(0, imageData?.rows || 10, function (rows: any) {
                parsedContent.tableRows = rows;
                setFileContent(parsedContent);
              });
              return;
            }
          } catch (e) {
            // Not a table or error extracting rows
          }
          setFileContent(parsedContent);
        });
      } else {
        alert("astro.FITS library not loaded");
      }
    } else {
      alert("Please upload a .fits or .lc FITS file");
    }
  };
  console.log(fileContent);
  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">FITS File Reader</h1>
      <input
        type="file"
        ref={fileInput}
        onChange={() => handleFileChange(fileInput.current?.files?.[0] ?? null)}
        className="mb-6"
      />

      {fileContent && (
        <div className="bg-gray-900 text-white p-4 rounded-lg max-w-3xl overflow-auto">
          <pre>{JSON.stringify(fileContent, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
