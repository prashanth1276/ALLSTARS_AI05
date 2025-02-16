import React from 'react';
import { Recycle, Trash2, Leaf } from 'lucide-react';

interface ResultDisplayProps {
  image: string;
  result: {
    category: string;
    confidence: number;
    guidance: string;
    detected_city: string;
  };
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, result }) => {
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
        return 'bg-blue-100 text-blue-800';
      case 'non-recyclable':
        return 'bg-red-100 text-red-800';
      case 'biodegradable':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {image && (
          <div className="relative">
            <img
              src={image}
              alt="Uploaded waste"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {result.detected_city}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {getCategoryIcon(result.category)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(result.category)}`}>
              {result.category}
            </span>
            <span className="text-sm text-gray-500">
              {result.confidence}% confidence
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">Disposal Guidance</h3>
            <p className="mt-2 text-gray-600">{result.guidance}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Location: {result.detected_city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;