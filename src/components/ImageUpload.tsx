import React, { useCallback, useState, useRef } from 'react';
import { Upload, Camera, Loader, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onImageUpload: (image: string, file: File, lat: string, lon: string) => Promise<void>;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const getLocation = (): Promise<{ lat: string; lon: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString()
          });
        },
        (error) => {
          reject(new Error('Could not retrieve location'));
        }
      );
    });
  };

  const processFile = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }

      const location = await getLocation();
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          await onImageUpload(reader.result as string, file, location.lat, location.lon);
        } catch (error) {
          showError('Error processing image');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError('An unexpected error occurred');
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="hover:opacity-75 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragging
            ? 'border-teal-500 bg-teal-50/10'
            : 'border-gray-300/50 hover:border-teal-400/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="flex space-x-4">
            <motion.div 
              className="p-4 bg-teal-500/10 rounded-full cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCameraClick}
            >
              <Upload className="h-8 w-8 text-teal-300" />
            </motion.div>
            <motion.div 
              className="p-4 bg-blue-500/10 rounded-full cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCameraClick}
            >
              <Camera className="h-8 w-8 text-blue-300" />
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-300 mb-2">
              {isDragging
                ? 'Drop your image here'
                : 'Drag and drop an image here, or click to select'}
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPG, PNG, WEBP (max 5MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
            disabled={isLoading}
          />

          <motion.button
            onClick={handleCameraClick}
            className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg 
              flex items-center space-x-2 shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span>{isLoading ? 'Processing...' : 'Upload Image'}</span>
          </motion.button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="bg-white/10 p-4 rounded-full">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;