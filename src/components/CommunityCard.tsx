import React from 'react';
import { Users, MessageSquare, Heart } from 'lucide-react';

const CommunityCard: React.FC = () => {
  const posts = [
    {
      user: 'Emily R.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'Just reached 500 points! Every small action counts 🌱',
      likes: 24,
      comments: 8
    },
    {
      user: 'David M.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'Found a new recycling center in downtown! DM for details 🔄',
      likes: 18,
      comments: 5
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-md rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-7 w-7 text-green-700" />
          <h2 className="text-xl font-bold text-green-900">Community</h2>
        </div>
        <button className="text-sm text-green-700 hover:text-green-900 transition font-medium">View All</button>
      </div>
      <div className="space-y-5">
        {posts.map((post, index) => (
          <div 
            key={index} 
            className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-green-300"
          >
            <div className="flex items-center space-x-3">
              <img
                src={post.avatar}
                alt={post.user}
                className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
              />
              <span className="font-semibold text-green-900">{post.user}</span>
            </div>
            <p className="text-green-800 mt-3 text-sm">{post.content}</p>
            <div className="flex items-center space-x-5 text-sm text-green-700 mt-4">
              <button className="flex items-center space-x-1 hover:text-green-900 transition">
                <Heart className="h-5 w-5" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-green-900 transition">
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityCard;