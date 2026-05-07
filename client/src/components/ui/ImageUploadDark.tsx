"use client";

import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";

interface ImageUploadDarkProps {
  value: string;
  onChange: (url: string, file?: File) => void;
}

export function ImageUploadDark({ value, onChange }: ImageUploadDarkProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {!value ? (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
              isDragging
                ? "border-orange-400 bg-orange-500/10"
                : "border-orange-500/30 bg-[#111526] hover:border-orange-400"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                <Upload size={20} />
              </div>
              <p className="text-sm text-white/70">
                Arrastrá una imagen o{" "}
                <span className="font-semibold text-orange-400">seleccioná un archivo</span>
              </p>
              <p className="text-xs text-white/40">PNG, JPG hasta 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <input
            type="url"
            placeholder="O pegá una URL de imagen"
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-orange-500/30 bg-[#111526] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-400"
          />
        </>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-orange-500/30">
          <img src={value} alt="Preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}