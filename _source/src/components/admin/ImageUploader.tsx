import React, { useRef, useState } from "react";
import { CheckCircle2, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ImagePreset = "photo" | "logo" | "favicon" | "opengraph";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  preset?: ImagePreset;
  label?: string;
  description?: string;
}

const presetInfo: Record<ImagePreset, { name: string; maxDim: number; aspect?: number; targetWidth?: number; targetHeight?: number }> = {
  photo: { name: "Fotografía HD", maxDim: 1920 },
  logo: { name: "Logo (Máx 600px)", maxDim: 600 },
  favicon: { name: "Favicon 1:1 (128x128px)", maxDim: 128, aspect: 1, targetWidth: 128, targetHeight: 128 },
  opengraph: { name: "OpenGraph Social (1200x630px)", maxDim: 1200, aspect: 1200 / 630, targetWidth: 1200, targetHeight: 630 },
};

export function ImageUploader({
  value,
  onChange,
  preset = "photo",
  label,
  description,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const info = presetInfo[preset];

  const processAndCompressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // SVG no se modifica en Canvas para mantener vectorial
      if (file.type === "image/svg+xml") {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (preset === "favicon") {
            width = info.targetWidth || 128;
            height = info.targetHeight || 128;
          } else if (preset === "opengraph") {
            width = info.targetWidth || 1200;
            height = info.targetHeight || 630;
          } else {
            // Escalar proporcionalmente si excede maxDim
            if (width > info.maxDim || height > info.maxDim) {
              if (width > height) {
                height = Math.round((height * info.maxDim) / width);
                width = info.maxDim;
              } else {
                width = Math.round((width * info.maxDim) / height);
                height = info.maxDim;
              }
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo obtener contexto 2D del Canvas"));
            return;
          }

          if (preset === "favicon" || preset === "opengraph") {
            // Recorte centrado (Cover)
            const srcAspect = img.width / img.height;
            const destAspect = width / height;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;

            if (srcAspect > destAspect) {
              sw = img.height * destAspect;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / destAspect;
              sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
          const quality = preset === "logo" || preset === "favicon" ? 0.92 : 0.85;

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Error al generar blob procesado"));
            },
            outputType,
            quality
          );
        };
        img.onerror = () => reject(new Error("No se pudo procesar la imagen seleccionada"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setProgressMsg("Optimizando y recortando imagen...");

    try {
      // 1. Procesar y comprimir en el cliente
      const processedBlob = await processAndCompressImage(file);
      const originalMB = (file.size / (1024 * 1024)).toFixed(2);
      const processedMB = (processedBlob.size / (1024 * 1024)).toFixed(2);

      setProgressMsg(`Subiendo a CDN Backblaze B2 (${processedMB} MB)...`);

      // 2. Subir a upload.php
      const formData = new FormData();
      const filename = file.name.replace(/\.[^/.]+$/, "") + (preset === "logo" ? ".png" : ".jpg");
      formData.append("file", processedBlob, filename);

      const uploadUrl = window.location.origin + window.location.pathname.replace(/\/admin\/?.*$/, "") + "/upload.php";
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let result: any;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Respuesta del servidor no válida al subir la imagen");
      }

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Error al guardar la imagen optimizada");
      }

      onChange(result.url);
      toast.success(`Imagen subida y optimizada (${originalMB}MB → ${processedMB}MB)`);
    } catch (err: any) {
      toast.error(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
      setProgressMsg("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative group h-20 w-32 rounded-xl border border-border overflow-hidden bg-muted/40 shrink-0">
            <img src={value} alt="Vista previa" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover imagen"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="grid h-20 w-32 place-items-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground shrink-0">
            <ImageIcon className="h-6 w-6 opacity-60" />
          </div>
        )}

        <div className="space-y-2 flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... o seleccioná un archivo"
              className="text-xs h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl h-9 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-teal" /> : <Upload className="h-4 w-4 mr-1 text-teal" />}
              Subir
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-mono text-[10px] bg-secondary px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-teal" /> Preset: {info.name}
            </span>
            {uploading && <span className="text-teal animate-pulse">{progressMsg}</span>}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={preset === "logo" ? "image/png,image/svg+xml,image/webp,image/jpeg" : "image/*"}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
