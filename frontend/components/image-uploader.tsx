"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UploadedImage {
  id: string;
  url: string;
}

interface ImageUploaderProps {
  caseId: string;
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
}

export function ImageUploader({ caseId, onImagesChange, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("case_id", caseId);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newImages.push(data.image);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setIsUploading(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  }, [caseId]);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition",
          dragActive
            ? "border-cyan-500 bg-cyan-50"
            : "border-[var(--border)] hover:border-cyan-400"
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
            <p className="text-[var(--muted-foreground)]">Enviando imagens...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-cyan-100 rounded-full">
              <Upload className="h-8 w-8 text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">
                Arraste as imagens ou clique para selecionar
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                JPEG, PNG ou WebP - Maximo 10MB por arquivo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Guidelines */}
      <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
        <h4 className="font-medium text-cyan-800 mb-2">Dicas para boas fotos:</h4>
        <ul className="text-sm text-cyan-700 space-y-1">
          <li>- Boa iluminacao (luz natural se possivel)</li>
          <li>- Imagem nitida e em foco</li>
          <li>- Inclua fotos de perto e uma visao geral</li>
          <li>- Evite sombras sobre a lesao</li>
          <li>- Adicione uma regua ou moeda para escala</li>
        </ul>
      </div>

      {/* Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group aspect-square">
              <Image
                src={image.url}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <ImageIcon className="h-5 w-5" />
          <span>Nenhuma imagem adicionada</span>
        </div>
      )}
    </div>
  );
}
