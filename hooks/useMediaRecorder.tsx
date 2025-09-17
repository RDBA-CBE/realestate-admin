"use client"

import { useState, useRef, useCallback } from 'react';

export const useMediaRecorder = (options = {}) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio || true,
        video: options.video || false,
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        if (options.onStop) {
          options.onStop(blob);
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.onerror = (event) => {
        setError(event.error);
        
        if (options.onError) {
          options.onError(event.error);
        }
      };
      
      mediaRecorder.start(options.timeSlice || 1000);
      setRecording(true);
      setPaused(false);
      
      if (options.onStart) {
        options.onStart();
      }
    } catch (err) {
      setError(err);
    }
  }, [JSON.stringify(options)]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);
    }
  }, [recording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording && !paused) {
      mediaRecorderRef.current.pause();
      setPaused(true);
      
      if (options.onPause) {
        options.onPause();
      }
    }
  }, [recording, paused, options]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording && paused) {
      mediaRecorderRef.current.resume();
      setPaused(false);
      
      if (options.onResume) {
        options.onResume();
      }
    }
  }, [recording, paused, options]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    
    setRecording(false);
    setPaused(false);
    setAudioBlob(null);
    setAudioUrl('');
    setError(null);
    chunksRef.current = [];
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [recording]);

  return {
    recording,
    paused,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};