import React, { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface VideoUploadProps {
  onVideoChange: (video: File | null) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

const VideoUploadWithPreview: React.FC<VideoUploadProps> = ({
  onVideoChange,
  acceptedFormats = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "mpeg", "mpg", "wmv", "flv", "3gp", "m4v"],
  maxSizeMB = 50, // Increased default since videos are larger
}) => {
  const [video, setVideo] = useState<{ file: File; preview: string } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  };

  const processFile = (file: File) => {
    setError("");

    // Get file extension
    const fileExtension = getFileExtension(file.name);
    
    // Check if file extension is in accepted formats
    if (!acceptedFormats.includes(fileExtension)) {
      setError(
        `Invalid file format: ${file.name}. Please upload ${acceptedFormats.join(", ")} videos.`
      );
      return;
    }

    // Only check size restriction
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large: ${file.name}. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    const preview = URL.createObjectURL(file);
    const newVideo = { file, preview };
    setVideo(newVideo);
    onVideoChange(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
      event.target.value = ""; // reset for reuploading
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processFile(event.dataTransfer.files[0]);
    }
  }, []);

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.preview);
    setVideo(null);
    onVideoChange(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Create accept attribute for file input
  const acceptAttribute = acceptedFormats.map(format => `.${format}`).join(',');

  return (
    <div className="w-full">
      {/* Drag and Drop Area */}
      {!video && (
        <div
          className={`
            cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
            ${error ? "border-red-300" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttribute}
            onChange={handleFileInput}
            className="hidden"
          />

          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">
              Upload/Drag your video
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: {acceptedFormats.join(", ")} <br />
              <strong>Max size: {maxSizeMB}MB</strong>
            </p>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Video Preview */}
      {video && (
        <div className="relative ">
          <div className=" relative w-full max-w-lg overflow-hidden rounded-lg border bg-black">
            <video
              src={video.preview}
              controls
              className="w-full h-64 object-contain"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              title="Remove video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>File: {video.file.name}</p>
            <p>Size: {(video.file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadWithPreview;