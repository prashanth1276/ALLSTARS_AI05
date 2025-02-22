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
  Info,
  Camera
} from 'lucide-react';

interface ResultCardProps {
  image: string;
  category: string | null;
  confidence: number;
  guidance: string;
  detectedCity: string;
  isLoading: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  image, 
  category, 
  confidence, 
  guidance, 
  detectedCity,
  isLoading 
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

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'recyclable':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-50',
          accent: 'text-blue-600'
        };
      case 'non-recyclable':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          hover: 'hover:bg-red-50',
          accent: 'text-red-600'
        };
      case 'biodegradable':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          hover: 'hover:bg-green-50',
          accent: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          hover: 'hover:bg-green-50',
          accent: 'text-green-600'
        };
    }
  };

  const colors = getCategoryColor(category);

  return (
    <motion.div 
      className="mt-8 rounded-2xl bg-white shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Camera className="h-6 w-6 text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Analysis Result</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Section */}
          <motion.div 
            className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden shadow-md"
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
          <div className="flex-1">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(category)}
                    <motion.div 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {category}
                    </motion.div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button 
                      className={`p-2 ${colors.hover} rounded-lg transition-colors`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className={`h-5 w-5 ${colors.accent}`} />
                    </motion.button>
                    <motion.button 
                      className={`p-2 ${colors.hover} rounded-lg transition-colors`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BookmarkPlus className={`h-5 w-5 ${colors.accent}`} />
                    </motion.button>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <span className={`text-sm font-medium ${colors.accent}`}>
                      {confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full ${colors.bg}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Guidance */}
                <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                  <p className="text-gray-700">{guidance}</p>
                </div>

                {/* Location Info */}
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className={`h-5 w-5 ${colors.accent}`} />
                  <span>Location: {detectedCity}</span>
                </div>

                {/* Impact Section */}
                <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                  <div className="flex items-start space-x-3">
                    <Info className={`h-5 w-5 ${colors.accent} mt-1`} />
                    <div>
                      <h4 className={`${colors.text} font-medium mb-2`}>Environmental Impact</h4>
                      <p className={`text-sm ${colors.text} mb-3`}>
                        Proper waste sorting helps reduce landfill waste and promotes recycling efficiency.
                        Keep up the great work!
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <motion.button 
                          className={`flex items-center space-x-1 ${colors.accent}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful</span>
                        </motion.button>
                        <span className={colors.text}>+10 points earned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;