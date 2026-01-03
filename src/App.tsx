import { useState, useEffect } from 'react';
import './App.css';
import { Mic, Settings, Copy, Trash2 } from 'lucide-react';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useDeepgram } from './hooks/useDeepgram';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepgram_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [timeoutTriggered, setTimeoutTriggered] = useState(false);

  // Deepgram Hook
  const { transcript, status, isConnected, connect, disconnect, clearTranscript } = useDeepgram({ apiKey });

  const isRecording = isConnected;

  const handleStop = () => {
    stopRecording();
    disconnect();
  };

  // Audio Hook with Silence Callback
  const { startRecording, stopRecording, error: micError } = useAudioRecorder(() => {
    console.log('Silence Timeout Triggered');
    setTimeoutTriggered(true);
    setTimeout(() => setTimeoutTriggered(false), 3000);
    handleStop();
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showSettings && (document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        toggleRecording();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, showSettings, apiKey]);

  const toggleRecording = async () => {
    if (isRecording) {
      handleStop();
    } else {
      await handleStart();
    }
  };

  const handleStart = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const result = await startRecording();
    if (result && result.recorder) {
      connect(result.recorder);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('deepgram_key', key);
    setApiKey(key);
    setShowSettings(false);
  };

  return (
    <div className="container">

      <h1 className="app-title">Wispr Clone</h1>

      {/* Toast */}
      {showToast && <div className="toast">Copied to clipboard!</div>}
      {timeoutTriggered && (
        <div className="toast" style={{ borderColor: 'var(--warning-color)', background: 'rgba(255, 152, 0, 0.2)', color: '#ffe0b2' }}>
          Recording stopped due to silence
        </div>
      )}

      {/* Mic Button */}
      <button
        onClick={toggleRecording}
        className={`mic-button ${isRecording ? 'recording' : ''}`}
        title="Press Spacebar to Toggle"
      >
        <Mic size={48} />
      </button>

      {/* Status */}
      <div className={`status-badge ${isRecording ? 'recording' : ''}`}>
        {micError ? `Error: ${micError}` : status}
      </div>

      {/* Transcript Area */}
      <div className="glass-panel transcript-box">
        {transcript || <span style={{ opacity: 0.5 }}>Transcribed text will appear here...</span>}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="action-btn" onClick={copyToClipboard} disabled={!transcript}>
          <Copy size={16} /> Copy
        </button>
        <button className="action-btn" onClick={clearTranscript} disabled={!transcript}>
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Settings Toggle */}
      <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
        <button
          className="btn-icon"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <Settings size={28} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', opacity: 0.7 }}>Deepgram API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Deepgram API Key"
                className="settings-input"
              />
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                Get your key from <a href="https://console.deepgram.com" target="_blank" className="text-white underline">console.deepgram.com</a>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => saveApiKey(apiKey)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ position: 'absolute', bottom: '2rem', opacity: 0.4, fontSize: '0.7rem' }}>
        Press space to record
      </div>

    </div>
  );
}

export default App;
