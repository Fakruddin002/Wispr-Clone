# Wispr Clone 🎙️

A lightweight, powerful voice-to-text desktop app that mimics the core flow of Wispr. Built to demonstrate how modern web tech (React) can power native desktop experiences (Tauri) with state-of-the-art AI transcription (Deepgram).

## What is this?

This project is a functional proof-of-concept for a voice dictation tool. Instead of just a tech demo, it's designed to be a usable desktop utility. It uses **Tauri** to wrap a React frontend into a super efficient native app, and **Deepgram's Nova-2** model to give you near-instant text from your speech.

I focused heavily on a clean architecture so you can easily rip out parts or extend it.

## Key Features

-   **⚡ Fast & Accurate**: Powered by Deepgram's streaming API, so words appear as you speak.
-   **🤫 Smart Silence**: Walks away when you do? The app auto-stops recording after 10 seconds of silence.
-   **⌨️ Native Feel**: Toggle recording globally with `Spacebar` (when focused) or click the big mic button.
-   **💎 Glassmorphism UI**: A sleek, modern interface that looks at home on your desktop.
-   **📋 Clipboard Ready**: One-click copy to get your text where it needs to go.

## Under the Hood 🛠️

I broke the code down into distinct layers to keep the `App.tsx` file clean and focused purely on UI.

### The Logic (Hooks)
Instead of stuffing everything into the view, I wrote two custom hooks:
1.  **`useAudioRecorder.ts`**: This handles the messy browser stuff—getting mic permissions, managing the `MediaRecorder` stream, and analyzing volume levels for the silence detection.
2.  **`useDeepgram.ts`**: This manages the WebSocket connection. It connects, handles the incoming JSON streams, and deals with potential network hiccups.

### The Stack
-   **Framework**: React + TypeScript + Vite (Fast dev cycle)
-   **App Runtime**: Tauri v2 (Rust-based, lighter than Electron)
-   **Styling**: Pure CSS (No heavy frameworks, just clean variables and glass effects)

## How to Run It

1.  **Grab the code**:
    ```bash
    git clone https://github.com/Fakruddin002/Wispr-Clone.git
    cd Wispr-Clone
    npm install
    ```

2.  **Fire it up**:
    ```bash
    # For browser development
    npm run dev
    
    # To launch as a desktop app (requires Rust)
    npm run tauri dev
    ```

3.  **Get a Key**:
    You'll need a free API Key from [Deepgram](https://console.deepgram.com). The app will ask for it the first time you try to record.

## Future Plans

Right now, it's a "Copy/Paste" workflow. The next logical step for a true Wispr clone would be implementing OS-level text injection (simulating keystrokes) so you can dictate directly into any window.

---
*Built with ❤️ for the love of AI and efficient coding.*
