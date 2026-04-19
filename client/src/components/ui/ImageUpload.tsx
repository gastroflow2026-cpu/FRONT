"use client";

import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <Upload size={28} />
            </div>
            <div>
              <p className={styles.textMain}>
                Arrastra una imagen o{" "}
                <span className={styles.browseBtn}>selecciona un archivo</span>
              </p>
              <p className={styles.textSub}>PNG, JPG hasta 5MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
        </div>
      ) : (
        <div className={styles.previewWrapper}>
          <img src={value} alt="Preview" className={styles.previewImage} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            title="Eliminar imagen"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}