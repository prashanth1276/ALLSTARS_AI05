import React from 'react';
import { motion } from 'framer-motion';
import { 
  Recycle, 
  Trash2, 
  Leaf, 
  Share2, 
  BookmarkPlus, 
  ThumbsUp, 
  MapPin, 
  Info,
  Mic,
  MessageSquare
} from 'lucide-react';

interface SpeechResultCardProps {
  speechText: string;
  result: {
    predicted_category: string;
    confidence: number;
    guidance: string;
    detected_city: string;
  };
  isLoading: boolean;
}

const SpeechResultCard: React.FC<SpeechResultCardProps> = ({
  speechText,
  result,
  isLoading
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
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
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          hover: 'hover:bg-gray-50',
          accent: 'text-gray-600'
        };
    }
  };

  const colors = getCategoryColor(result.predicted_category);

  return (
    <motion.div 
      className="mt-8 rounded-2xl bg-white shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Mic className="h-6 w-6 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Voice Analysis Result</h3>
        </div>

        {/* Speech Text Section */}
        <motion.div 
          className="mb-6 bg-purple-50 rounded-xl p-4 border border-purple-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-purple-500 mt-1" />
            <div>
              <h4 className="text-purple-800 font-medium mb-2">Recognized Speech</h4>
              <p className="text-purple-900">{speechText}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(result.predicted_category)}
              <motion.div 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {result.predicted_category}
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

          {/* Guidance */}
          <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
            <p className="text-gray-700">{result.guidance}</p>
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
                    <span>Helpful</span> </motion.button>
                  <span className={colors.text}>+10 points earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpeechResultCard;