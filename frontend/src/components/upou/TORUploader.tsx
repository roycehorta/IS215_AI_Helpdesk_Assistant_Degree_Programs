// frontend/src/components/upou/TORUploader.tsx
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface TORUploaderProps {
  onResult: (recommendation: string) => void;
}

export function TORUploader({ onResult }: TORUploaderProps) {
  const [file, setFile]         = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [preview, setPreview]   = useState("");
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError("");
    setPreview("");

    // Validate type
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, JPG, and PNG files are supported.");
      return;
    }

    // Validate size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB.");
      return;
    }

    setFile(f);

    // Show image preview
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // strip data:...;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(import.meta.env.VITE_API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _route:    "analyze-tor",
          fileBase64: base64,
          fileType:   file.type,
          fileName:   file.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to analyze");

      onResult(data.recommendation);
      setFile(null);
      setPreview("");

    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview("");
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-primary/50 mx-auto" />
            <p className="text-sm font-medium text-gray-700">
              Drop your TOR or Diploma here
            </p>
            <p className="text-xs text-gray-400">
              PDF, JPG, PNG — max 5MB
            </p>
          </div>
        )}
      </div>

      {/* Image preview */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
        />
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      {/* Analyze button */}
      {file && (
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing document...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Analyze & Get Recommendations
            </>
          )}
        </Button>
      )}
    </div>
  );
}