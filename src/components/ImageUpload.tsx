import React, { useCallback, useState, useRef } from 'react';
import { Upload, Camera, Loader, Mic } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (image: string, apiResult: any) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [speechInput, setSpeechInput] = useState('');
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  const uploadToServer = async (file: File, lat: string, lon: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lat', lat);
    formData.append('lon', lon);

    try {
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadVoiceToServer = async (audioBlob: Blob, lat: string, lon: string) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('lat', lat);
    formData.append('lon', lon);

    try {
      const response = await fetch('http://localhost:8000/classify_voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading voice:', error);
      throw error;
    }
  };

  const processFile = (file: File) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
  
    setIsUploading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lon = position.coords.longitude.toString();
  
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const apiResult = await uploadToServer(file, lat, lon);
            onImageUpload(reader.result as string, apiResult);
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing file:', error);
          setIsUploading(false);
          alert('Error processing image. Please try again.');
        }
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        alert('Could not retrieve location.');
        setIsUploading(false);
      }
    );
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsSpeechActive(true);
      setSpeechInput('Listening...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setSpeechInput(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser.');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude.toString();
            const lon = position.coords.longitude.toString();

            try {
              const response = await fetch(`http://localhost:8000/classify_text?text=${encodeURIComponent(transcript)}`);
              if (!response.ok) throw new Error('Network response was not ok');
              const result = await response.json();
              onImageUpload('', result);
            } catch (error) {
              console.error('Error processing speech:', error);
              alert('Error processing speech. Please try again.');
            }
          },
          (error) => {
            console.error('Error getting geolocation:', error);
            alert('Could not retrieve location.');
          }
        );

        recognition.stop();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsSpeechActive(false);
      setSpeechInput('');
    };

    recognition.onend = () => {
      setIsSpeechActive(false);
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeechActive(false);
      setSpeechInput('');
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processFile(file);
      }
    },
    []
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
        isDragging
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-green-400'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative">
          <div className={`flex space-x-4 ${isLoading ? 'opacity-50' : ''}`}>
            <div className="p-4 bg-green-100 rounded-full">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
            <div 
              className={`p-4 ${isSpeechActive ? 'bg-red-100' : 'bg-yellow-100'} rounded-full cursor-pointer`}
              onClick={() => isSpeechActive ? stopSpeechRecognition() : startSpeechRecognition()}
            >
              <Mic className={`h-8 w-8 ${isSpeechActive ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="h-8 w-8 text-green-200 animate-spin" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 mb-2">
            {isDragging
              ? 'Drop your image here'
              : 'Drag and drop an image here, or click to select'}
          </p>
          <p className="text-sm text-gray-200">
            Supports: JPG, PNG, WEBP (max 5MB)
          </p>
        </div>

        {speechInput && (
          <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              {speechInput}
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center space-x-2 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="h-5 w-5" />
          <span>Upload Image</span>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;