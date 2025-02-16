import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquareText, MapPin, Loader, Share2, BookmarkPlus } from 'lucide-react';

interface SpeechResultCardProps {
  recognizedText: string;
  predictedCategory: string;
  guidance: string;
  detected_city: string;
  isLoading: boolean;
}

const SpeechResultCard: React.FC<SpeechResultCardProps> = ({
  recognizedText,
  predictedCategory,
  guidance,
  detected_city,
  isLoading,
}) => {
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

  const themeColor = getThemeColor(predictedCategory);

  return (
    <motion.div
      className="mt-8 rounded-2xl bg-white border shadow-lg overflow-hidden p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start space-x-4">
        <motion.div whileHover={{ scale: 1.1 }}>
          <Mic className="h-10 w-10 text-gray-700" />
        </motion.div>
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Speech Recognition</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader className="h-6 w-6 text-gray-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${themeColor}-100 text-${themeColor}-800 border border-${themeColor}-200`}>
                Classification: {predictedCategory}
              </div>
            </div>
          )}
          <div className="mt-4 flex space-x-2">
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
      </div>
    </motion.div>
  );
};

export default SpeechResultCard;
