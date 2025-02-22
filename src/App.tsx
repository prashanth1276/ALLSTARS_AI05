import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Camera, 
  Info, 
  LogOut, 
  Mic, 
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import ResultCard from './components/ResultCard';
import LeaderboardCard from './components/LeaderboardCard';
import InfoCard from './components/InfoCard';
import SpeechInput from './components/SpeechInput';
import SpeechResultCard from './components/SpeechResultCard';
import CommunityCard from './components/CommunityCard';
import AuthPages from './components/AuthPages';

interface ClassificationResult {
  predicted_category: string;
  confidence: number;
  guidance: string;
  detected_city: string;
  nearby_waste_centers: string[];
}

interface User {
  name: string;
  email: string;
}

interface ErrorMessage {
  type: 'error' | 'warning' | 'success';
  message: string;
}

const DISPOSAL_GUIDELINES: { [key: string]: string } = {
  "Recyclable": "This item can be recycled. Please clean it and place it in your recycling bin.",
  "Non-Recyclable": "This item cannot be recycled. Please dispose of it in your regular waste bin.",
  "Biodegradable": "This item is biodegradable. Consider composting or using organic waste disposal.",
  "Unknown": "Unable to determine disposal method. Please check with your local waste management."
};

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);

  const showError = useCallback((message: string, type: 'error' | 'warning' | 'success' = 'error') => {
    setError({ type, message });
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleImageUpload = async (image: string, file: File, lat: string, lon: string) => {
    setIsLoading(true);
    setSelectedImage(image);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lat', lat);
      formData.append('lon', lon);

      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to classify image');
      }

      const apiResult = await response.json();
      setResult(apiResult);
      setPoints(prev => prev + 10);
      showError('Successfully classified waste!', 'success');
    } catch (error) {
      console.error('Error processing image:', error);
      showError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechResult = async (text: string) => {
    if (!text.trim()) {
      showError('No speech detected. Please try again.');
      return;
    }

    setIsLoading(true);
    setSpeechText(text);
    
    try {
      console.log('Sending text to backend:', text); // Debug log

      const response = await fetch('http://localhost:8000/classify_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData); // Debug log
        throw new Error('Failed to classify text');
      }

      const apiResult = await response.json();
      console.log('API Response:', apiResult); // Debug log

      // Transform the API response to match our expected format
      const transformedResult: ClassificationResult = {
        predicted_category: apiResult.predicted_category || 'Unknown',
        confidence: 85, // Default confidence since API doesn't provide it
        guidance: DISPOSAL_GUIDELINES[apiResult.predicted_category] || DISPOSAL_GUIDELINES['Unknown'],
        detected_city: 'Local Area',
        nearby_waste_centers: []
      };

      setResult(transformedResult);
      setPoints(prev => prev + 10);
      showError('Successfully processed speech!', 'success');
    } catch (error) {
      console.error('Error processing speech:', error);
      showError('Failed to process speech. Please try again.');
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
    setResult(null);
    setSelectedImage(null);
    setSpeechText(null);
    setPoints(0);
  };

  const handleModeSwitch = () => {
    setIsSpeechMode(!isSpeechMode);
    setResult(null);
    setSelectedImage(null);
    setSpeechText(null);
    setIsListening(false);
  };

  if (!user && showAuth) {
    return (
      <AuthPages
        onLogin={handleLogin}
        onSignup={handleSignup}
        onClose={() => setShowAuth(false)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-green-700">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
              error.type === 'error'
                ? 'bg-red-500'
                : error.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            } text-white`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error.message}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 hover:opacity-75 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav 
        className="bg-white/10 backdrop-blur-md sticky top-0 z-50 border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Sparkles className="h-8 w-8 text-teal-300 absolute animate-ping opacity-30" />
                <Sparkles className="h-8 w-8 text-teal-300 relative" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-green-300 text-transparent bg-clip-text">
                EcoSnap
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 bg-teal-800/50 px-4 py-2 rounded-full border border-teal-600/30">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-teal-100">{points} pts</span>
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
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome to EcoSnap
                    </h1>
                    <p className="text-teal-200">
                      Your AI-powered waste classification assistant
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    className="bg-teal-800/30 p-6 rounded-xl border border-teal-600/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Camera className="h-8 w-8 text-teal-300 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Snap</h3>
                    <p className="text-teal-200 text-sm">
                      Take or upload a photo of your waste item
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-teal-800/30 p-6 rounded-xl border border-teal-600/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mic className="h-8 w-8 text-teal-300 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Speak</h3>
                    <p className="text-teal-200 text-sm">
                      Or describe your waste item using voice
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-teal-800/30 p-6 rounded-xl border border-teal-600/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Info className="h-8 w-8 text-teal-300 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Learn</h3>
                    <p className="text-teal-200 text-sm">
                      Get proper disposal guidelines
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">
                  {isSpeechMode ? 'Describe Your Waste' : 'Snap & Sort Your Waste'}
                </h2>
                <motion.button
                  onClick={handleModeSwitch}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSpeechMode ? <Camera className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  <span>{isSpeechMode ? 'Switch to Camera' : 'Switch to Voice'}</span>
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {!isSpeechMode ? (
                  <motion.div
                    key="image-upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
                    {selectedImage && (result || isLoading) && (
                      <ResultCard
                        image={selectedImage}
                        category={result?.predicted_category || null}
                        confidence={result?.confidence || 0}
                        guidance={result?.guidance || ''}
                        detectedCity={result?.detected_city || 'Unknown'}
                        isLoading={isLoading}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="speech-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SpeechInput
                      onSpeechResult={handleSpeechResult}
                      isListening={isListening}
                      onListeningChange={setIsListening}
                    />
                    {speechText && (result || isLoading) && (
                      <SpeechResultCard
                        speechText={speechText}
                        result={{
                          predicted_category: result?.predicted_category || 'Unknown',
                          confidence: result?.confidence || 0,
                          guidance: result?.guidance || '',
                          detected_city: result?.detected_city || 'Unknown'
                        }}
                        isLoading={isLoading}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <LeaderboardCard />
            <CommunityCard />
            <InfoCard />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;