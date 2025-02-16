import React, { useState } from 'react';
import { Upload, Award, Sparkles, TrendingUp, Camera, Info, LogOut, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import ResultCard from './components/ResultCard';
import LeaderboardCard from './components/LeaderboardCard';
import InfoCard from './components/InfoCard';
import SpeechResultCard from './components/SpeechResultCard';
import CommunityCard from './components/CommunityCard';
import AuthPages from './components/AuthPages';

interface ClassificationResult {
  predicted_category: string; // Changed from "category" to match API response
  confidence: number;
  guidance: string;
  image_url: string;
  recognized_text: string; // New field from API response
  detected_city: string;
}

interface User {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [speechResult, setSpeechResult] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSpeechMode, setIsSpeechMode] = useState<boolean>(false);

  const handleImageUpload = async (image: string, apiResult: ClassificationResult) => {
    setIsLoading(true);
    setSelectedImage(image);

    try {
      setResult(apiResult);
      setPoints((prev) => prev + 10);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechResult = async (text: string) => {
    setIsLoading(true);
    setSpeechResult(text);

    try {
      // Simulate API call to get classification result
      const apiResult: ClassificationResult = {
        predicted_category: 'Recyclable',
        confidence: 0.95,
        guidance: 'Please dispose of this item in the recycling bin.',
        image_url: '',
        recognized_text: text,
        detected_city: 'New York',
      };
      setResult(apiResult);
      setPoints((prev) => prev + 10);
    } catch (error) {
      console.error('Error processing speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setUser({ name: email.split('@')[0], email });
    setShowAuth(false);
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setUser({ name, email });
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(true);
  };

  if (!user && showAuth) {
    return (
      <AuthPages
        onLogin={handleLogin}
        onSignup={handleSignup}
        onClose={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-700 to-green-500 text-gray-100">
      {/* Navbar */}
      <motion.nav
        className="bg-white/10 backdrop-blur-md sticky top-0 z-50 shadow-lg px-6 py-4 border-b border-gray-100/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sparkles className="h-8 w-8 text-teal-300 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-green-300 text-transparent bg-clip-text">
              EcoSnap
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-teal-700 px-4 py-2 rounded-full shadow-md">
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-gray-100">{points} pts</span>
            </div>

            {user && (
              <div className="flex items-center space-x-3">
                <motion.div
                  className="h-10 w-10 bg-gradient-to-r from-teal-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.name[0].toUpperCase()}
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Section: Waste Upload & Result */}
          <div className="lg:col-span-2 space-y-8">
            {/* About EcoSnap and Solution Overview */}
            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Section Header */}
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-green-800">
                  <Info className="inline-block mr-2" size={24} /> Discover EcoSnap
                </h2>
                <p className="mt-2 text-lg text-green-700">Your eco-friendly waste disposal assistant</p>
              </div>

              {/* Section Content */}
              <div>
                <h3 className="text-xl font-semibold text-green-800">
                  <Camera className="inline-block mr-2 align-middle" size={24} /> What is EcoSnap?
                </h3>
                <p className="text-lg text-gray-700">
                  EcoSnap is a smart platform that uses AI to classify waste into recyclable, biodegradable, or non-recyclable categories. It also provides location-based disposal instructions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-green-800">
                  <Camera className="inline-block mr-2 align-middle" size={24} /> How It Works
                </h3>
                <p className="text-lg text-gray-700">
                  Simply upload a photo of your waste, and EcoSnap will categorize it and give you disposal guidelines based on your location.
                </p>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-6">
                <p className="text-green-700">Start sorting your waste smarter with EcoSnap today!</p>
              </div>
            </motion.div>

            {/* Snap & Sort Your Waste Section */}
            <motion.div
              className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-100">Snap & Sort Your Waste</h2>
                <TrendingUp className="h-6 w-6 text-teal-300" />
              </div>

              {!isSpeechMode ? (
                <>
                  <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
                  {selectedImage && (result || isLoading) && (
                    <ResultCard
                      image={selectedImage}
                      result={result?.predicted_category ?? 'Unknown'}
                      confidence={result?.confidence ?? 0}
                      guidance={result?.guidance ?? 'No guidance available'}
                      detectedCity={result?.detected_city ?? 'Unknown'}
                      recognizedText={result?.recognized_text ?? 'No text detected'}
                      isLoading={isLoading}
                    />
                  )}
                </>
              ) : (
                <SpeechResultCard
                  recognizedText={speechResult ?? 'Listening...'}
                  predictedCategory={result?.predicted_category ?? 'Unknown'}
                  guidance={result?.guidance ?? 'No guidance available'}
                  detected_city={result?.detected_city ?? 'Unknown'}
                  isLoading={isLoading}
                />
              )}

              <button
                onClick={() => setIsSpeechMode(!isSpeechMode)}
                className="mt-4 p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                {isSpeechMode ? 'Switch to Image Upload' : 'Switch to Speech Mode'}
              </button>
            </motion.div>
          </div>

          {/* Right Section: Leaderboard, Community, and Info Cards */}
          <div className="space-y-8">
            <LeaderboardCard />
            <CommunityCard />
            <InfoCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;