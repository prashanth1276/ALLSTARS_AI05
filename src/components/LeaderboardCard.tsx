import React from 'react';
import { Trophy, Medal, Crown, Sparkles } from 'lucide-react';

const LeaderboardCard: React.FC = () => {
  const leaderboardData = [
    { name: 'Sarah M.', points: 450, streak: 7 },
    { name: 'John D.', points: 380, streak: 5 },
    { name: 'Emma W.', points: 310, streak: 3 },
    { name: 'Alex K.', points: 290, streak: 4 },
    { name: 'Mike R.', points: 270, streak: 2 },
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-white backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-900">Top Recyclers</h2>
        </div>
        <span className="text-sm text-gray-500">This Week</span>
      </div>
      <div className="space-y-4">
        {leaderboardData.map((user, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition duration-300 ease-in-out hover:shadow-md border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              {index === 0 ? (
                <Crown className="h-5 w-5 text-yellow-500" />
              ) : index === 1 ? (
                <Medal className="h-5 w-5 text-gray-400" />
              ) : index === 2 ? (
                <Medal className="h-5 w-5 text-amber-600" />
              ) : (
                <span className="w-5 text-center text-gray-500 font-medium">{index + 1}</span>
              )}
              <div>
                <span className="font-medium text-gray-900">{user.name}</span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span>{user.streak} day streak</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-semibold">{user.points}</span>
              <span className="text-gray-400 group-hover:text-green-600 transition-colors">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardCard;
