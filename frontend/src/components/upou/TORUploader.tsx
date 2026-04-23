// frontend/src/components/upou/TORUploader.tsx
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface TORUploaderProps {
  onResult: (recommendation: string) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_SIZE_MB = 5;

export function TORUploader({ onResult }: TORUploaderProps) {
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    // Check extension
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type not supported. Please upload JPG, PNG, or PDF only. (.webp, .heic, and other formats are not accepted)`;
    }
    // Check MIME type
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `Invalid file type: ${f.type}. Only JPG, PNG, and PDF are supported.`;
    }
    // Check size
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (f: File) => {
    setError("");
    setPreview("");

    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(f);

    // Show image preview for images only
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
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
        reader.onload  = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(import.meta.env.VITE_API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _route:     "analyze-tor",
          fileBase64: base64,
          fileType:   file.type,
          fileName:   file.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to analyze document");
      if (!data.success) throw new Error(data.recommendation ?? "Could not extract text from document");

      // Pass recommendation up to chat — triggers as bot message
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
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : file
              ? "border-green-400 bg-green-50 cursor-default"
              : "border-primary/30 hover:border-primary/60 hover:bg-primary/5 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            // reset input so same file can be re-selected
            e.target.value = "";
          }}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-7 w-7 text-green-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB · {file.type.split("/")[1].toUpperCase()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview("");
                setError("");
              }}
              className="ml-auto text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-7 w-7 text-primary/40 mx-auto" />
            <p className="text-sm font-medium text-gray-700">
              Drop your TOR or Diploma here
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, PDF only · Max {MAX_SIZE_MB}MB
            </p>
            <p className="text-[11px] text-red-400">
              ⚠️ .webp, .heic, and other formats are not supported
            </p>
          </div>
        )}
      </div>

      {/* Image preview */}
      {preview && (
        <img
          src={preview}
          alt="Document preview"
          className="w-full max-h-40 object-contain rounded-lg border border-gray-200 bg-gray-50"
        />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-500 text-sm shrink-0">⚠️</span>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Analyze button */}
      {file && !error && (
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing with Amazon Textract...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Analyze & Get Program Recommendations
            </>
          )}
        </Button>
      )}
    </div>
  );
}