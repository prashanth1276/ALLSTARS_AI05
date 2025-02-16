import React from 'react';
import { motion } from 'framer-motion';
import { 
  Recycle, 
  Trash2, 
  Leaf, 
  Loader, 
  Share2, 
  BookmarkPlus, 
  ThumbsUp, 
  MapPin, 
  Mic, 
  Info
} from 'lucide-react';

interface ResultCardProps {
  image: string;
  result: string | null;
  confidence: number;
  guidance: string;
  detectedCity: string;
  recognizedText: string; // Speech-to-text result
  isLoading: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  image, 
  result, 
  confidence, 
  guidance, 
  detectedCity,
  recognizedText, 
  isLoading = false 
}) => {
  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'recyclable':
        return <Recycle className="h-8 w-8 text-blue-500" />;
      case 'non-recyclable':
        return <Trash2 className="h-8 w-8 text-red-500" />;
      case 'biodegradable':
        return <Leaf className="h-8 w-8 text-green-500" />;
      default:
        return null;
    }
  };

  const getThemeColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'recyclable':
        return 'blue';
      case 'non-recyclable':
        return 'red';
      case 'biodegradable':
        return 'green';
      default:
        return 'gray';
    }
  };

  const themeColor = getThemeColor(result);

  return (
    <motion.div 
      className="mt-8 rounded-2xl bg-white border shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        {image ? (
          // Image Detection Card
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Section */}
            <motion.div 
              className={`relative w-full md:w-48 h-48 rounded-xl overflow-hidden border border-${themeColor}-200 shadow-md`}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={image}
                alt="Uploaded waste"
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </motion.div>

            {/* Content Section */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(result)}
                  <motion.div 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${themeColor}-100 text-${themeColor}-800 border border-${themeColor}-200`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {result}
                  </motion.div>
                </div>
                <div className="flex space-x-2">
                  <motion.button 
                    className={`p-2 hover:bg-${themeColor}-100 rounded-lg transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className={`h-5 w-5 text-${themeColor}-600`} />
                  </motion.button>
                  <motion.button 
                    className={`p-2 hover:bg-${themeColor}-100 rounded-lg transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BookmarkPlus className={`h-5 w-5 text-${themeColor}-600`} />
                  </motion.button>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Confidence</span>
                  <span className={`text-sm font-medium text-${themeColor}-600`}>
                    {confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full bg-${themeColor}-500`}
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Guidance */}
              <div className={`bg-${themeColor}-50 rounded-xl p-4 border border-${themeColor}-200`}>
                <p className="text-gray-700">{guidance}</p>
              </div>

              {/* Location Info */}
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className={`h-5 w-5 text-${themeColor}-600`} />
                <span>Detected Current Location: {detectedCity}</span>
              </div>
            </div>
          </div>
        ) : recognizedText ? (
          // Speech Recognition Card
          <div className="rounded-2xl bg-gray-100 border border-gray-300 shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <Mic className="h-8 w-8 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Speech Recognition</h3>
                <p className="text-gray-600 mt-2">{recognizedText}</p>
                <div className="mt-4 flex items-center space-x-2">
                  {getCategoryIcon(result)}
                  <span className={`text-sm font-medium text-${themeColor}-700`}>
                    Category: {result}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  <span className="text-gray-700">Location: {detectedCity}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder if neither image nor speech is provided
          <div className="text-center text-gray-500 p-4">No input provided.</div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;
