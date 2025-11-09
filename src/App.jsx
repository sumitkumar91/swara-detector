import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [baseFrequency, setBaseFrequency] = useState(240);
  const [selectedRaga, setSelectedRaga] = useState('none');
  const [currentFrequency, setCurrentFrequency] = useState('-- Hz');
  const [currentSwara, setCurrentSwara] = useState('No swara detected');
  const [isRecording, setIsRecording] = useState(false);
  const [swaras, setSwaras] = useState([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const javascriptNodeRef = useRef(null);

  // Calculate swara frequencies based on base frequency
  const calculateSwaras = () => {
    if (!baseFrequency || baseFrequency <= 0) {
      alert('Please enter a valid base frequency');
      return;
    }

    const swaraRatios = [
      { name: 'Sa', ratio: 1/1 },
      { name: 'Re♭', ratio: 256/243 },
      { name: 'Re', ratio: 9/8 },
      { name: 'Ga♭', ratio: 32/27 },
      { name: 'Ga', ratio: 81/64 },
      { name: 'Ma', ratio: 4/3 },
      { name: 'Ma♯', ratio: 729/512 },
      { name: 'Pa', ratio: 3/2 },
      { name: 'Dha♭', ratio: 128/81 },
      { name: 'Dha', ratio: 27/16 },
      { name: 'Ni♭', ratio: 16/9 },
      { name: 'Ni', ratio: 243/128 }
    ];

    const calculatedSwaras = swaraRatios.map(swara => ({
      ...swara,
      frequency: baseFrequency * swara.ratio
    }));

    setSwaras(calculatedSwaras);
    setCurrentFrequency(`${baseFrequency} Hz`);
    setCurrentSwara('Sa (Base)');
  };

  // Initialize with default swaras
  const initializeSwaraDisplay = () => {
    const defaultSwaras = [
      { name: 'Sa', frequency: 240.00 },
      { name: 'Re♭', frequency: 252.89 },
      { name: 'Re', frequency: 270.00 },
      { name: 'Ga♭', frequency: 284.44 },
      { name: 'Ga', frequency: 303.75 },
      { name: 'Ma', frequency: 320.00 },
      { name: 'Ma♯', frequency: 341.72 },
      { name: 'Pa', frequency: 360.00 },
      { name: 'Dha♭', frequency: 379.26 },
      { name: 'Dha', frequency: 405.00 },
      { name: 'Ni♭', frequency: 426.67 },
      { name: 'Ni', frequency: 455.63 }
    ];
    setSwaras(defaultSwaras);
  };

  // Find closest swara to detected frequency
  const findClosestSwara = (frequency) => {
    let closestSwara = null;
    let minDifference = Infinity;

    swaras.forEach((swara, index) => {
      const difference = Math.abs(frequency - swara.frequency);
      if (difference < minDifference) {
        minDifference = difference;
        closestSwara = { ...swara, index };
      }
    });

    const tolerance = baseFrequency * 0.05;
    return minDifference < tolerance ? closestSwara : null;
  };

  // Process audio for pitch detection
  const processAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let maxAmplitude = 0;
    let maxIndex = 0;

    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        maxIndex = i;
      }
    }

    const frequency = maxIndex * audioContextRef.current.sampleRate / analyserRef.current.fftSize;

    if (frequency > 100 && frequency < 1000) {
      setCurrentFrequency(`${frequency.toFixed(2)} Hz`);
      
      const detectedSwara = findClosestSwara(frequency);
      if (detectedSwara) {
        setCurrentSwara(detectedSwara.name);
      }
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      javascriptNodeRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);
      analyserRef.current.connect(javascriptNodeRef.current);
      javascriptNodeRef.current.connect(audioContextRef.current.destination);

      javascriptNodeRef.current.onaudioprocess = processAudio;
    } catch (err) {
      alert('Error accessing microphone: ' + err);
      stopRecording();
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (javascriptNodeRef.current) {
      javascriptNodeRef.current.disconnect();
      javascriptNodeRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setCurrentFrequency('-- Hz');
    setCurrentSwara('No swara detected');
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
      setIsRecording(true);
    } else {
      stopRecording();
      setIsRecording(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeSwaraDisplay();
  }, []);

  // Calculate swaras when base frequency changes
  useEffect(() => {
    calculateSwaras();
  }, [baseFrequency]);

  return (
    <div className="container">
      <header>
        <h1>Swara Detector</h1>
        <p className="subtitle">Detect Indian Classical Music Swaras from Audio Input</p>
      </header>
      
      <div className="main-content">
        <div className="input-section">
          <h2 className="section-title">Input & Detection</h2>
          
          <div className="input-group">
            <label htmlFor="base-frequency">Base Sa Frequency (Hz)</label>
            <input 
              type="number" 
              id="base-frequency" 
              value={baseFrequency}
              onChange={(e) => setBaseFrequency(parseFloat(e.target.value))}
              min="100" 
              max="500" 
              step="1"
            />
            <p className="frequency-note">
              Standard base Sa is typically 240 Hz for female voices and 130 Hz for male voices
            </p>
          </div>
          
          <div className="input-group">
            <label htmlFor="raga-select">Raga (Optional)</label>
            <select 
              id="raga-select" 
              value={selectedRaga}
              onChange={(e) => setSelectedRaga(e.target.value)}
            >
              <option value="none">None - Show All Swaras</option>
              <option value="yaman">Yaman</option>
              <option value="bhairav">Bhairav</option>
              <option value="malkauns">Malkauns</option>
              <option value="bhairavi">Bhairavi</option>
            </select>
          </div>
          
          <button className="btn" onClick={calculateSwaras}>
            Detect Swaras
          </button>
          <button 
            className={`btn btn-secondary ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            {isRecording ? 'Stop Recording' : 'Record Audio'}
          </button>
          
          <div className="frequency-display">
            <span>{currentFrequency}</span>
          </div>
          
          <div className="sa-reference">
            <div className="reference-title">Common Sa Reference Frequencies</div>
            <ul className="reference-list">
              <li>Female Vocalists: 240 Hz</li>
              <li>Male Vocalists: 130 Hz</li>
              <li>Harmonium: 240 Hz</li>
              <li>Tanpura: 110 Hz (Male) / 220 Hz (Female)</li>
            </ul>
          </div>
        </div>
        
        <div className="output-section">
          <h2 className="section-title">Detected Swaras</h2>
          
          <div className="swara-display">
            {swaras.map((swara, index) => (
              <div 
                key={swara.name} 
                className={`swara-card ${currentSwara === swara.name ? 'active' : ''}`}
              >
                <div className="swara-name">{swara.name}</div>
                <div className="swara-frequency">{swara.frequency.toFixed(2)} Hz</div>
              </div>
            ))}
          </div>
          
          <div className="detected-swaras">
            <h3 className="section-title">Current Detection</h3>
            <div className="current-swaras-display">
              {currentSwara}
            </div>
          </div>
          
          <div className="sa-reference">
            <div className="reference-title">About Swaras</div>
            <p className="about-swaras">
              In Indian classical music, the seven basic swaras are Sa, Re, Ga, Ma, Pa, Dha, and Ni. 
              These correspond to the Western solfège: Do, Re, Mi, Fa, Sol, La, Ti. The relationships 
              between swaras follow specific mathematical ratios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;