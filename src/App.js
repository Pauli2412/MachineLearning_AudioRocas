import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import WaveSurfer from 'wavesurfer.js';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [features, setFeatures] = useState([]);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data.prediction);
      setFeatures(response.data.features);

      // Crear instancia de wavesurfer
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#A9A9A9',
        progressColor: '#5F9EA0',
      });

      // Cargar el archivo de audio
      const fileURL = URL.createObjectURL(file);
      wavesurfer.current.load(fileURL);
    } catch (error) {
      console.error('Error al predecir:', error);
      setResult('Error al predecir');
    }
  };

  const chartData = {
    labels: features.map((_, index) => `Feature ${index + 1}`),
    datasets: [
      {
        label: 'Características del audio',
        data: features,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="App">
      <h1>Predicción de Estado de Rocas</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".wav" onChange={handleFileChange} />
        <button type="submit">Predecir</button>
      </form>
      {result && <p>Resultado: {result}</p>}
      {file && (
        <div>
          <h2>Forma de Onda del Audio</h2>
          <div id="waveform" ref={waveformRef}></div>
        </div>
      )}
      {features.length > 0 && (
        <div>
          <h2>Histograma de Características</h2>
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}

export default App;
