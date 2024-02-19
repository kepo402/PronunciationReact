import React, { useState, useEffect, useRef } from 'react';
import './AudioRecorder.css';
import speakerIcon from './images/speaker_icon.jpg';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // New state for tracking if audio is playing
  const timerIntervalRef = useRef(null);
  const referenceWord = "Hello, shey àtí bẹ̀rẹ̀ ni?";
  const referenceAudioUrl = "/Recording.mp3";

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
    setTimer(0);
  };

  const deleteRecording = (index) => {
    setRecordedChunks(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timer) => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderAudioList = () => {
    return recordedChunks.map((chunk, index) => {
      const audioUrl = URL.createObjectURL(new Blob([chunk], { type: 'audio/mp3' }));
      return (
        <div key={index} className="audio-item">
          <audio controls src={audioUrl}></audio>
          <button onClick={() => deleteRecording(index)}>Delete</button>
        </div>
      );
    });
  };

  const playReferenceAudio = () => {
    const audio = new Audio(process.env.PUBLIC_URL + referenceAudioUrl);
    audio.onplay = () => setIsPlaying(true); // Set isPlaying state to true when audio starts playing
    audio.onended = () => setIsPlaying(false); // Set isPlaying state to false when audio finishes playing
    audio.play();
  };

  return (
    <div>
      <div className="header">
        <h1>Yoruba Pronunciation</h1>
      </div>
      <button onClick={startRecording} disabled={isRecording}>Record</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop</button>
      <div>{formatTime(timer)}</div>
      <div>{renderAudioList()}</div>
      <div>
        <h2>Reference Word: {referenceWord}</h2>
        <button onClick={playReferenceAudio} className={isPlaying ? 'pulsating' : ''}>
          <img src={speakerIcon} alt="Speaker Icon" /> Play
        </button>
      </div>
    </div>
  );
};

export default AudioRecorder;