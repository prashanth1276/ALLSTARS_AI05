import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Result from './Result';

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !lat || !lon) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('lat', lat);
    formData.append('lon', lon);

    try {
      const response = await fetch('http://localhost:8000/classify_voice', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Audio for Classification</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-2" />
      <input type="text" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} className="border p-2 w-full mb-2" />
      <input type="text" placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} className="border p-2 w-full mb-2" />
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
      {isLoading && <p>Loading...</p>}
      {result && <Result {...result} />}
    </div>
  );
};