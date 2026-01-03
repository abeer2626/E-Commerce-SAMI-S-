'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export default function ImageUpload({ value, onChange, onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      setIsUploading(true);

      try {
        if (onUpload) {
          // Use custom upload function (e.g., upload to S3, Cloudinary)
          const url = await onUpload(file);
          setPreview(url);
          onChange(url);
          toast.success('Image uploaded successfully');
        } else {
          // Convert to base64 for demo purposes
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreview(base64String);
            onChange(base64String);
            toast.success('Image uploaded successfully');
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Product Image
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden border-2 border-gray-200 group"
          >
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="p-3 bg-white rounded-full text-red-600 hover:bg-red-50 transition"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`relative aspect-square w-full max-w-sm border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive || isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {dragActive || isDragActive ? (
                      <Upload className="h-8 w-8 text-primary-600" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isDragActive ? 'Drop image here' : 'Upload product image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="hidden" name="image" value={preview} />
    </div>
  );
}
