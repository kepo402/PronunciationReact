import React, { useState, useEffect } from 'react';
import './AudioRecorder.css';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [referenceWord, setReferenceWord] = useState('');
  const [referenceAudioUrl, setReferenceAudioUrl] = useState('');
  let timerInterval = null;

  useEffect(() => {
    if (isRecording) {
      timerInterval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerInterval);
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
      const audioUrl = URL.createObjectURL(new Blob([chunk], { type: 'audio/webm' }));
      return (
        <div key={index} className="audio-item">
          <audio controls src={audioUrl}></audio>
          <button onClick={() => deleteRecording(index)}>Delete</button>
        </div>
      );
    });
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
        <audio controls src={referenceAudioUrl}></audio>
      </div>
    </div>
  );
};

export default AudioRecorder;