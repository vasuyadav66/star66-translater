# ★ star66 translater

> **Translate the voice and words of any person into any language in the world.**

A modern, fast, and feature-packed voice and text translator web application supporting **130+ languages**, speech-to-text recognition, neural speech synthesis (voice output), and a real-time **Two-Way Voice Conversation** mode.

---

## 🌟 Key Features

- 🎙️ **Voice Recording & Translation ("Voice Way")**:
  - **Live Voice Recording**: Record your voice in any language with MediaRecorder and continuous speech recognition.
  - **Live Timer & Waveform**: See real-time recording timer (`00:03...`) and animated audio waveform visualizer.
  - **Play My Recorded Voice**: Play back, pause, and verify your original recorded audio clip directly in the browser.
  - **Post-Recording Instant Language Translation**: Record your voice once, then select ANY language to translate into instantly without re-recording!
  - **Voice Output**: Instant Text-To-Speech (TTS) audio playback with voice speed control (`0.8x`, `1.0x`, `1.2x`).
  - **Auto-Speak mode**: Automatically pronounces the translation out loud as soon as recording finishes.

- 📝 **Words Translation ("Words Way")**:
  - Live side-by-side / dual card view showing original words and translated words.
  - Auto-detection of 130+ source languages.
  - Real-time character and word count tracking.
  - Phonetics and transliteration support for non-Latin scripts.

- 💬 **Two-Way Live Voice Conversation Mode**:
  - Seamless face-to-face dialogue between two people speaking different languages.
  - Dedicated microphones for Person A and Person B.
  - Automatically translates and speaks aloud in the other person's native language.

- 🌐 **130+ World Languages Supported**:
  - Full modal search and filter across all global languages (English, Spanish, Hindi, French, German, Mandarin Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Korean, Bengali, Tamil, Telugu, Urdu, Swahili, Tagalog, and more).
  - Quick-switch language chips for popular languages.
  - One-click language swap button (`⇄`).

- 🌌 **Cosmic Futuristic UI**:
  - Starfield background with twinkling star particles.
  - Glassmorphism dark and light themes.
  - Sound effects (synthesized audio chimes on recording start/stop).
  - Fullscreen presentation view to display translated words clearly to someone across a table or street.
  - Local history drawer with replay and export capabilities.

---

## 🚀 Live Demo & Deployment

This project is built with zero build step dependencies (vanilla modern HTML5, CSS3, and ES6 JavaScript), meaning it can be run instantly on **GitHub Pages**:

1. In your GitHub repository (`vasuyadav66/star66-translater`), go to **Settings** > **Pages**.
2. Under **Branch**, select `main` and `/ (root)`.
3. Click **Save**.
4. Your website will be live at:
   `https://vasuyadav66.github.io/star66-translater/`

---

## 💻 How to Run Locally

### Option 1: Direct in Browser
Simply double click `index.html` or open it in Google Chrome, Microsoft Edge, Safari, or Brave.

### Option 2: Local Static Server
```bash
# Clone the repository
git clone https://github.com/vasuyadav66/star66-translater.git
cd star66-translater

# Run using npx serve or python
npx serve .
# Or using Python:
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

> **Note**: For microphone permissions (Web Speech API), modern browsers require either `http://localhost` or an `https://` connection (such as GitHub Pages).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism, Keyframe animations).
- **Speech Recognition**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- **Voice Synthesis**: Web Speech API (`SpeechSynthesis` & `SpeechSynthesisUtterance`).
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, `OscillatorNode` synthesizer).
- **Translation Engine**: Neural Translation GTX endpoint with automatic fallback to MyMemory API.
- **Storage**: Browser `localStorage` for history and preferences.

---

## 📄 License

MIT License &bull; Created with pride by **vasuyadav66**.
