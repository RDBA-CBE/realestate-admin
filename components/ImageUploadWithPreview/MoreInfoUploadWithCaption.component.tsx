import React, { useCallback, useState, useRef, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";

export interface MoreInfoNewItem {
  file: File;
  preview: string;
  caption: string;
}

export interface MoreInfoExistingItem {
  id: number;
  url?: string;
  image_url?: string;
  image?: string;
  caption?: string;
  order?: number;
}

interface MoreInfoUploadProps {
  newImages: MoreInfoNewItem[];
  onNewImagesChange: (images: MoreInfoNewItem[]) => void;
  existingImages?: MoreInfoExistingItem[];
  onExistingImagesChange?: (images: MoreInfoExistingItem[]) => void;
  onExistingImageDelete?: (id: number) => Promise<void> | void;
  maxFiles?: number;
  acceptedFormats?: string[];
  error?: string;
}

const MoreInfoUploadWithCaption: React.FC<MoreInfoUploadProps> = ({
  newImages = [],
  onNewImagesChange,
  existingImages = [],
  onExistingImagesChange,
  onExistingImageDelete,
  maxFiles = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImagesCount = existingImages.length + newImages.length;

  useEffect(() => {
    return () => {
      newImages.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  const processFiles = (files: FileList) => {
    setLocalError("");
    const availableSlots = maxFiles - totalImagesCount;

    if (availableSlots <= 0) {
      setLocalError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setLocalError(`Only ${availableSlots} more image(s) can be added (max ${maxFiles}).`);
    }

    const addedItems: MoreInfoNewItem[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

      if (!acceptedFormats.includes(file.type)) {
        setLocalError(
          `Invalid file format for "${file.name}". Please upload JPEG, PNG, or WebP files.`
        );
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setLocalError(`File too large: "${file.name}". Maximum size is 5MB.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      addedItems.push({
        file,
        preview,
        caption: "",
      });
    }

    if (addedItems.length > 0) {
      onNewImagesChange([...newImages, ...addedItems]);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files) {
        processFiles(event.dataTransfer.files);
      }
    },
    [totalImagesCount, newImages, maxFiles, acceptedFormats]
  );

  const openFileDialog = () => {
    if (totalImagesCount >= maxFiles) {
      setLocalError(`Maximum limit of ${maxFiles} images reached.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleNewCaptionChange = (index: number, caption: string) => {
    const updated = [...newImages];
    updated[index] = { ...updated[index], caption };
    onNewImagesChange(updated);
  };

  const handleRemoveNew = (index: number) => {
    const item = newImages[index];
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }
    const updated = newImages.filter((_, i) => i !== index);
    onNewImagesChange(updated);
    setLocalError("");
  };

  const handleExistingCaptionChange = (index: number, caption: string) => {
    if (!existingImages || !onExistingImagesChange) return;
    const updated = [...existingImages];
    updated[index] = { ...updated[index], caption };
    onExistingImagesChange(updated);
  };

  const handleDeleteExisting = async (id: number) => {
    if (!onExistingImageDelete) return;
    setDeletingId(id);
    try {
      await onExistingImageDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Upload Dropzone */}
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
        } ${localError || error ? "border-red-300" : ""}`}
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
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={totalImagesCount >= maxFiles}
        />

        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
            Upload/Drag reference images (QR codes, brochures, etc.)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPEG, PNG, WebP format · Maximum size 5MB per image · Max {maxFiles} images
          </p>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {totalImagesCount} of {maxFiles} images added
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              disabled={totalImagesCount >= maxFiles}
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {/* Errors */}
      {(localError || error) && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{localError || error}</p>
        </div>
      )}

      {/* Existing Images (for update property) */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Existing Images ({existingImages.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {existingImages.map((item, index) => {
              const imageUrl = item?.url || item?.image_url || item?.image;
              const isDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                    <img
                      src={imageUrl}
                      alt={item.caption || "More info image"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`caption-existing-${item.id}`}
                      className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200"
                    >
                      Caption
                    </label>
                    <input
                      id={`caption-existing-${item.id}`}
                      type="text"
                      name="caption"
                      value={item.caption || ""}
                      onChange={(e) => handleExistingCaptionChange(index, e.target.value)}
                      placeholder="Enter caption (e.g. Brochure, QR Code)"
                      className="form-input w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="mt-1 block text-[11px] text-gray-400">
                      Uploaded image #{index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(item.id)}
                    disabled={isDeleting}
                    className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {existingImages.length > 0 ? "New Images to Upload" : "Uploaded Images"} ({newImages.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {newImages.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                  <img
                    src={item.preview}
                    alt={item.caption || `New image preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`caption-new-${index}`}
                    className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Caption
                  </label>
                  <input
                    id={`caption-new-${index}`}
                    type="text"
                    name="caption"
                    value={item.caption || ""}
                    onChange={(e) => handleNewCaptionChange(index, e.target.value)}
                    placeholder="Enter caption (e.g. Brochure, QR Code)"
                    className="form-input w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="mt-1 block truncate text-[11px] text-gray-400" title={item.file?.name}>
                    {item.file?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveNew(index)}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreInfoUploadWithCaption;
