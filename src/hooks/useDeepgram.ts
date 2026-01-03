import { useState, useRef, useCallback, useEffect } from 'react';

const DEEPGRAM_URL = 'wss://api.deepgram.com/v1/listen?smart_format=true&model=nova-2';

interface UseDeepgramOptions {
    apiKey: string;
}

export const useDeepgram = ({ apiKey }: UseDeepgramOptions) => {
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<string>('Ready');
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback((recorder: MediaRecorder) => {
        if (!apiKey) return;

        try {
            setStatus('Connecting...');
            const socket = new WebSocket(DEEPGRAM_URL, ['token', apiKey]);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus('Connected');
                setIsConnected(true);
                if (recorder.state === 'inactive') {
                    recorder.start(250);
                }
            };

            socket.onmessage = (message) => {
                try {
                    const received = JSON.parse(message.data);
                    const transcriptPart = received.channel?.alternatives[0]?.transcript;
                    if (transcriptPart && received.is_final) {
                        setTranscript(prev => prev + (prev ? ' ' : '') + transcriptPart);
                    }
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            };

            socket.onerror = (error) => {
                console.error('Deepgram WebSocket Error', error);
                setStatus('Connection Error');
                setIsConnected(false);
            };

            socket.onclose = () => {
                setStatus('Ready');
                setIsConnected(false);
            };

            // Send data
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socket.readyState === 1) {
                    socket.send(event.data);
                }
            };

        } catch (e: any) {
            setStatus('Error: ' + e.message);
        }
    }, [apiKey]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            if (socketRef.current.readyState === 1) {
                socketRef.current.close();
            }
            socketRef.current = null;
        }
        setIsConnected(false);
        setStatus('Ready');
    }, []);

    const clearTranscript = useCallback(() => setTranscript(''), []);

    return {
        transcript,
        status,
        isConnected,
        connect,
        disconnect,
        clearTranscript
    };
};
