'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentProof {
  id: string;
  url: string;
  date: string;
  amount: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface PaymentProofUploadProps {
  existingProofs?: PaymentProof[];
  onUpload: (files: File[]) => Promise<void>;
  vendorId?: string;
}

export default function PaymentProofUpload({
  existingProofs = [],
  onUpload,
  vendorId,
}: PaymentProofUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );

    if (files.length === 0) {
      setError('Please select image files only');
      return;
    }

    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (files.some((f) => !f.type.startsWith('image/'))) {
      setError('Please select image files only');
      return;
    }

    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="payment-proofs"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />
        <label htmlFor="payment-proofs" className="cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : 'Upload Payment Proofs'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Drag & drop or click to select
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG up to 5MB each • Max 5 files
          </p>
        </label>

        {/* Selected Files Preview */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <p className="text-xs font-medium text-gray-700 mb-2">
                Selected Files:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
                  >
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-700 max-w-[150px] truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3 w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Existing Proofs */}
      {existingProofs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Payment Proofs ({existingProofs.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {existingProofs.map((proof) => (
              <div key={proof.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {(proof.amount * 278).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(proof.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(proof.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>ℹ️ Why Upload Payment Proofs?</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1">
          <li>• Build trust with customers and platform</li>
          <li>• Get &quot;Verified Vendor&quot; badge faster</li>
          <li>• Higher visibility in search results</li>
          <li>• Increased customer confidence</li>
        </ul>
      </div>
    </div>
  );
}
