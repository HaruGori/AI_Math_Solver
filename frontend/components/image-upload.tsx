"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  value: File | null
}

export function ImageUpload({ onImageChange, value }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageChange(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange],
  )

  const handleRemove = useCallback(() => {
    onImageChange(null)
    setPreview(null)
  }, [onImageChange])

  return (
    <div className="space-y-4">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">画像をアップロード</p>
            <p className="text-xs text-muted-foreground">クリックまたはドラッグ&ドロップ</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden bg-muted/30">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
