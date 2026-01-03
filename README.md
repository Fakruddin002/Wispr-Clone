# Wispr Clone

A functional clone of Wispr Flow, built with Tauri, React, and Deepgram. This desktop application provides real-time, high-accuracy voice-to-text transcription.

## Features

- **Push-to-Talk**: Easy control via UI button or `Spacebar` shortcut.
- **Silence Timeout**: Automatically stops recording after 10 seconds of silence (VAD).
- **Deepgram API**: Powered by the `nova-2` model for lightning-fast and accurate transcription.
- **Cross-Platform**: Built with Tauri for Windows, macOS, and Linux.
- **Modern UI**: Clean, glassmorphism-inspired interface with rich interactivity.

## Architecture

The project follows a component-based architecture with strict separation of concerns:

- **UI Layer (`src/App.tsx`)**: Handles rendering, user interactions, and visual feedback. It does not contain business logic.
- **Audio Logic (`src/hooks/useAudioRecorder.ts`)**: Encapsulates microphone permission handling, stream acquisition, and `MediaRecorder` lifecycle management.
- **API Logic (`src/hooks/useDeepgram.ts`)**: Manages the persistent WebSocket connection to Deepgram, handling real-time streams and message parsing.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    # or for Tauri desktop mode (requires Rust/Tauri setup)
    npm run tauri dev
    ```
3.  **API Key**:
    - Obtain an API Key from [Deepgram Console](https://console.deepgram.com).
    - Enter it in the app's Settings menu.

## Technologies

- **Frontend**: React, Vite, TypeScript, CSS Modules (Pure CSS)
- **Desktop Runtime**: Tauri (Rust)
- **Speech Engine**: Deepgram Nova-2 (via WebSocket)

## Known Limitations

- **Text Injection**: Currently supports "Copy to Clipboard". Direct insertion into other apps (like Wispr Flow) requires OS-level accessibility APIs which are planned for future Tauri plugin integration.
- **Audio Format**: Uses `audio/webm` which is standard for browsers/Tauri.

## License
MIT
