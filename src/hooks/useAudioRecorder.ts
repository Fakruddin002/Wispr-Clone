import { useState, useRef, useCallback } from 'react';

const SILENCE_THRESHOLD = 0.02; // RMS threshold for silence
const SILENCE_DURATION = 10000; // 10 seconds in ms

export const useAudioRecorder = (onSilence?: () => void) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const cleanupAudioLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const detectSilence = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);

    if (rms > SILENCE_THRESHOLD) {
      lastSoundTimeRef.current = Date.now();
    }

    if (Date.now() - lastSoundTimeRef.current > SILENCE_DURATION) {
      // Silence detected
      if (onSilence) onSilence();
      cleanupAudioLoop(); // Stop checking
      return;
    }

    rafIdRef.current = requestAnimationFrame(detectSilence);
  }, [onSilence, cleanupAudioLoop]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);

      const recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);

      // Setup Silence Detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      lastSoundTimeRef.current = Date.now();
      detectSilence(); // Start loop

      return { stream: audioStream, recorder };
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied or not available.');
      return null;
    }
  }, [detectSilence]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cleanupAudioLoop();
    setMediaRecorder(null);
    setStream(null);
  }, [mediaRecorder, stream, cleanupAudioLoop]);

  return {
    startRecording,
    stopRecording,
    mediaRecorder,
    stream,
    error
  };
};

