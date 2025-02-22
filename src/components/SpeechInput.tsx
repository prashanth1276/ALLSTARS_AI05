import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechInputProps {
  onSpeechResult: (text: string) => Promise<void>;
  isListening: boolean;
  onListeningChange: (isListening: boolean) => void;
}

const SpeechInput: React.FC<SpeechInputProps> = ({
  onSpeechResult,
  isListening,
  onListeningChange
}) => {
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        onListeningChange(true);
        setTranscript('');
      };

      recognition.onend = () => {
        onListeningChange(false);
      };

      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setTranscript(currentTranscript);

        if (event.results[event.results.length - 1].isFinal) {
          handleFinalTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        showError('Error occurred in recognition: ' + event.error);
        onListeningChange(false);
      };

      recognitionRef.current = recognition;
    } else {
      showError('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onListeningChange]);

  const handleFinalTranscript = async (finalTranscript: string) => {
    try {
      await onSpeechResult(finalTranscript);
    } catch (error) {
      showError('Error processing speech input');
    }
  };

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        recognitionRef.current.start();
      }
    } catch (error) {
      showError('Microphone access denied');
    }
  }, [isListening]);

  return (
    <div className="space-y-4">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="hover:opacity-75 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Voice Input</h3>
          <motion.button
            onClick={toggleListening}
            className={`p-4 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-teal-500 hover:bg-teal-600'
            } transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MicOff className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="not-recording"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Mic className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="space-y-4">
          <div className={`min-h-[100px] p-4 rounded-lg bg-white/5 border ${
            isListening ? 'border-teal-500/50' : 'border-white/10'
          }`}>
            {transcript || (
              <span className="text-gray-400">
                {isListening ? 'Listening...' : 'Click the microphone to start speaking'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechInput;