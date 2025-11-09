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
  const canvasRef = useRef(null);
  
  // Store pitch data for graph
  const pitchDataRef = useRef([]);
  const maxDataPoints = 60; // Show last 5 seconds (if updating 12 times per second)

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
  };

  // Initialize with default swaras
  const initializeSwaraDisplay = () => {
    calculateSwaras();
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

    const tolerance = baseFrequency * 0.08; // 8% tolerance
    return minDifference < tolerance ? closestSwara : null;
  };

  // Get sensible graph frequency range based on base frequency
  const getFrequencyRange = () => {
    // For base frequency 240Hz, range should be roughly 200-500Hz to cover one octave up
    const minFreq = baseFrequency * 0.8;  // One note below base Sa
    const maxFreq = baseFrequency * 2.1;  // One octave + one note above base Sa
    return { minFreq, maxFreq };
  };

  // Draw the graph
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const { minFreq, maxFreq } = getFrequencyRange();

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (time - 5 second marks)
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i * (width - 2 * padding) / 5);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines (frequency - swara ranges)
    for (let i = 0; i <= 6; i++) {
      const y = padding + (i * (height - 2 * padding) / 6);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Y-axis (Frequency)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X-axis (Time)
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#f39c12';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Frequency labels (Y-axis) - show actual frequency values
    for (let i = 0; i <= 6; i++) {
      const freq = (maxFreq - (i * (maxFreq - minFreq) / 6)).toFixed(0);
      const y = padding + (i * (height - 2 * padding) / 6);
      ctx.fillText(`${freq} Hz`, padding - 25, y + 4);
    }

    // Time labels (X-axis) - 0 to 5 seconds
    for (let i = 0; i <= 5; i++) {
      const time = i;
      const x = padding + (i * (width - 2 * padding) / 5);
      ctx.fillText(`${time}s`, x, height - padding + 20);
    }

    // Draw horizontal lines for each swara frequency
    ctx.strokeStyle = 'rgba(143, 68, 173, 0.3)';
    ctx.lineWidth = 1;
    swaras.forEach(swara => {
      const freqRatio = (swara.frequency - minFreq) / (maxFreq - minFreq);
      const y = padding + (1 - freqRatio) * (height - 2 * padding);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Label the swara
      ctx.fillStyle = 'rgba(143, 68, 173, 0.8)';
      ctx.font = '11px Arial';
      ctx.fillText(swara.name, width - padding + 5, y + 3);
    });

    // Draw pitch data if we have any
    const data = pitchDataRef.current;
    if (data.length > 1) {
      // Draw the pitch line
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
        const freqRatio = (point.frequency - minFreq) / (maxFreq - minFreq);
        const y = padding + (1 - freqRatio) * (height - 2 * padding);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points for detected swaras
      data.forEach((point, index) => {
        if (point.swaraName) {
          const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
          const freqRatio = (point.frequency - minFreq) / (maxFreq - minFreq);
          const y = padding + (1 - freqRatio) * (height - 2 * padding);
          
          // Draw point with glow effect
          ctx.fillStyle = '#9B59B6';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();

          // Draw white border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw swara name for the most recent point
          if (index === data.length - 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(point.swaraName, x, y - 10);
          }
        }
      });
    } else {
      // Show help text when no data
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Start Recording" and sing to see your pitch', width / 2, height / 2);
    }

    // Draw titles
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pitch vs Time Graph', width / 2, 25);

    // Axis titles
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency (Hz)', 0, 0);
    ctx.restore();
    
    ctx.fillText('Time (seconds)', width / 2, height - 10);
  };

  // Add pitch data and update graph
  const addPitchData = (frequency, swaraName) => {
    pitchDataRef.current.push({
      frequency,
      swaraName,
      timestamp: Date.now()
    });

    // Keep only the last maxDataPoints
    if (pitchDataRef.current.length > maxDataPoints) {
      pitchDataRef.current = pitchDataRef.current.slice(-maxDataPoints);
    }

    drawGraph();
  };

  // Simple pitch detection
  const detectPitch = (dataArray, sampleRate) => {
    let maxAmplitude = 0;
    let maxIndex = 0;

    // Only analyze lower frequencies (up to 1000Hz) for voice
    const maxFrequencyIndex = Math.min(1000 * dataArray.length / sampleRate, dataArray.length / 2);
    
    for (let i = 1; i < maxFrequencyIndex; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        maxIndex = i;
      }
    }

    const frequency = maxIndex * sampleRate / dataArray.length;
    return frequency;
  };

  // Process audio
  const processAudio = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const frequency = detectPitch(dataArray, audioContextRef.current.sampleRate);

    // Only update if frequency is in reasonable vocal range
    if (frequency > 80 && frequency < 800) {
      const frequencyDisplay = `${frequency.toFixed(1)} Hz`;
      setCurrentFrequency(frequencyDisplay);
      
      const detectedSwara = findClosestSwara(frequency);
      if (detectedSwara) {
        setCurrentSwara(detectedSwara.name);
        addPitchData(frequency, detectedSwara.name);
      } else {
        addPitchData(frequency, null);
      }
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Clear previous data
      pitchDataRef.current = [];
      drawGraph();
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096; // Higher FFT for better frequency resolution
      analyserRef.current.smoothingTimeConstant = 0.8;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      javascriptNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      analyserRef.current.connect(javascriptNodeRef.current);
      javascriptNodeRef.current.connect(audioContextRef.current.destination);

      javascriptNodeRef.current.onaudioprocess = processAudio;
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Error accessing microphone. Please allow microphone permissions.');
      stopRecording();
    }
  };

  // Stop recording
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
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    setCurrentFrequency('-- Hz');
    setCurrentSwara('No swara detected');
  };

  // Toggle recording
  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
      setIsRecording(true);
    } else {
      stopRecording();
      setIsRecording(false);
    }
  };

  // Clear graph
  const clearGraph = () => {
    pitchDataRef.current = [];
    drawGraph();
  };

  // Initialize
  useEffect(() => {
    initializeSwaraDisplay();
    // Initial graph draw
    setTimeout(() => drawGraph(), 100);
  }, []);

  // Recalculate when base frequency changes
  useEffect(() => {
    calculateSwaras();
    drawGraph();
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
          
          <button 
            className={`btn ${isRecording ? 'recording' : 'btn-secondary'}`}
            onClick={toggleRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          
          <button className="btn btn-clear" onClick={clearGraph}>
            Clear Graph
          </button>
          
          <div className="frequency-display">
            <span>{currentFrequency}</span>
          </div>
          
          <div className="recording-status">
            Status: {isRecording ? 
              <span style={{color: '#f39c12'}}>Recording... Sing into microphone</span> : 
              <span>Ready to record</span>
            }
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
                <div className="swara-frequency">{swara.frequency.toFixed(1)} Hz</div>
              </div>
            ))}
          </div>
          
          <div className="detected-swaras">
            <h3 className="section-title">Current Detection</h3>
            <div className="current-swaras-display">
              {currentSwara}
            </div>
          </div>

          {/* Pitch vs Time Graph */}
          <div className="graph-section">
            <h3 className="section-title">Pitch vs Time Graph</h3>
            <div className="graph-container">
              <canvas 
                ref={canvasRef}
                width={600}
                height={350}
                className="pitch-graph"
              />
            </div>
            <div className="graph-info">
              <p>• <span style={{color: '#FF6B35'}}>Orange line</span> shows your pitch over last 5 seconds</p>
              <p>• <span style={{color: '#9B59B6'}}>Purple lines</span> show expected swara frequencies</p>
              <p>• Purple dots appear when you match a swara frequency</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer>
        <p>Swara Detector &copy; 2023 | Hackathon Project</p>
      </footer>
    </div>
  );
}

export default App;