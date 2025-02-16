import React from 'react';
import { Info, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const InfoCard: React.FC = () => {
  const tips = [
    {
      text: 'Compost food scraps like fruit peels and vegetable waste to enrich soil naturally.',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />, 
      type: 'success'
    },
    {
      text: 'Drop off old electronics at e-waste collection centers instead of throwing them away.',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, 
      type: 'warning'
    },
    {
      text: 'Avoid recycling greasy pizza boxes as they contaminate paper recycling.',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, 
      type: 'warning'
    },
    {
      text: 'Donate clothes and shoes instead of discarding them—help others while reducing waste!',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />, 
      type: 'success'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-white backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">Pro Tips</h2>
      </div>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-4 rounded-lg transition duration-300 ease-in-out hover:shadow-md ${
              tip.type === 'warning' ? 'bg-yellow-100 border border-yellow-300' : 'bg-green-100 border border-green-300'
            }`}
          >
            {tip.icon}
            <div>
              <span className="text-gray-800 font-medium">{tip.text}</span>
              <div className="mt-1 text-sm">
                <span className={`font-semibold ${
                  tip.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {tip.type === 'warning' ? 'Important Reminder' : 'Best Practice'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
