// star66 translater - Core Engine
// Handles Speech Recognition, Neural Translation, Speech Synthesis, Web Audio Visualizer, and Two-Way Dialogue

(function () {
  'use strict';

  // --- STATE ---
  let state = {
    srcLang: 'auto',
    tgtLang: 'es',
    detectedLang: null,
    convLangA: 'en',
    convLangB: 'es',
    isRecording: false,
    activeRecordingSource: null, // 'main', 'convA', 'convB'
    audioStream: null,
    audioContext: null,
    analyser: null,
    animFrameId: null,
    autoSpeak: true,
    soundFx: true,
    speechRate: 1.0,
    theme: localStorage.getItem('star66_theme') || 'dark',
    history: JSON.parse(localStorage.getItem('star66_history') || '[]'),
    activeModalType: 'src', // 'src', 'tgt', 'convA', 'convB'
    translateDebounceTimer: null,
    availableVoices: []
  };

  // --- POPULAR LANGUAGES FOR QUICK CHIPS ---
  const POPULAR_CODES = ['en', 'es', 'hi', 'fr', 'de', 'zh-CN', 'ja', 'ar', 'ru', 'pt'];

  // --- DOM ELEMENTS ---
  const el = {
    // Header & Global
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    soundFxBtn: document.getElementById('soundFxBtn'),
    soundFxIcon: document.getElementById('soundFxIcon'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyCount: document.getElementById('historyCount'),
    historyDrawer: document.getElementById('historyDrawer'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    historyItemsList: document.getElementById('historyItemsList'),
    toastNotice: document.getElementById('toastNotice'),
    toastText: document.getElementById('toastText'),
    toastIcon: document.getElementById('toastIcon'),
    starBackground: document.getElementById('starBackground'),

    // View Tabs
    tabStandard: document.getElementById('tabStandard'),
    tabConversation: document.getElementById('tabConversation'),
    standardTranslatorView: document.getElementById('standardTranslatorView'),
    conversationView: document.getElementById('conversationView'),

    // Standard Translation Bar
    srcLangBtn: document.getElementById('srcLangBtn'),
    srcLangName: document.getElementById('srcLangName'),
    srcLangFlag: document.getElementById('srcLangFlag'),
    srcQuickChips: document.getElementById('srcQuickChips'),
    swapLangBtn: document.getElementById('swapLangBtn'),
    tgtLangBtn: document.getElementById('tgtLangBtn'),
    tgtLangName: document.getElementById('tgtLangName'),
    tgtLangFlag: document.getElementById('tgtLangFlag'),
    tgtQuickChips: document.getElementById('tgtQuickChips'),

    // Voice & Cards
    mainMicBtn: document.getElementById('mainMicBtn'),
    voiceStatusLabel: document.getElementById('voiceStatusLabel'),
    voiceStatusText: document.getElementById('voiceStatusText'),
    srcPanelCard: document.getElementById('srcPanelCard'),
    sourceTextInput: document.getElementById('sourceTextInput'),
    clearTextBtn: document.getElementById('clearTextBtn'),
    pasteTextBtn: document.getElementById('pasteTextBtn'),
    interimSpeechBox: document.getElementById('interimSpeechBox'),
    visualizerContainer: document.getElementById('visualizerContainer'),
    audioVisualizer: document.getElementById('audioVisualizer'),
    sourceWordCount: document.getElementById('sourceWordCount'),
    speakSourceBtn: document.getElementById('speakSourceBtn'),
    copySourceBtn: document.getElementById('copySourceBtn'),
    detectedLangBadge: document.getElementById('detectedLangBadge'),

    tgtPanelCard: document.getElementById('tgtPanelCard'),
    translationOutputText: document.getElementById('translationOutputText'),
    phoneticsDisplay: document.getElementById('phoneticsDisplay'),
    autoSpeakCheckbox: document.getElementById('autoSpeakCheckbox'),
    voiceSpeedSelect: document.getElementById('voiceSpeedSelect'),
    targetWordCount: document.getElementById('targetWordCount'),
    speakTargetBtn: document.getElementById('speakTargetBtn'),
    copyTargetBtn: document.getElementById('copyTargetBtn'),
    downloadTransBtn: document.getElementById('downloadTransBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),

    // Conversation Mode Elements
    conversationDialogue: document.getElementById('conversationDialogue'),
    convEmptyState: document.getElementById('convEmptyState'),
    convLangABtn: document.getElementById('convLangABtn'),
    convLangAFlag: document.getElementById('convLangAFlag'),
    convLangAName: document.getElementById('convLangAName'),
    convMicBtnA: document.getElementById('convMicBtnA'),
    convStatusA: document.getElementById('convStatusA'),

    convLangBBtn: document.getElementById('convLangBBtn'),
    convLangBFlag: document.getElementById('convLangBFlag'),
    convLangBName: document.getElementById('convLangBName'),
    convMicBtnB: document.getElementById('convMicBtnB'),
    convStatusB: document.getElementById('convStatusB'),

    // Modal Elements
    langModalOverlay: document.getElementById('langModalOverlay'),
    closeLangModalBtn: document.getElementById('closeLangModalBtn'),
    modalTitleText: document.getElementById('modalTitleText'),
    langSearchInput: document.getElementById('langSearchInput'),
    modalLangListGrid: document.getElementById('modalLangListGrid'),

    // Fullscreen Elements
    fullscreenOverlay: document.getElementById('fullscreenOverlay'),
    closeFsBtn: document.getElementById('closeFsBtn'),
    fsTargetLangLabel: document.getElementById('fsTargetLangLabel'),
    fsTranslatedText: document.getElementById('fsTranslatedText'),
    fsSourceText: document.getElementById('fsSourceText'),
    fsSpeakBtn: document.getElementById('fsSpeakBtn')
  };

  // --- INITIALIZATION ---
  function init() {
    applyTheme(state.theme);
    generateStarParticles();
    renderQuickChips();
    updateLanguageButtons();
    updateHistoryCount();
    setupSpeechRecognition();
    setupSpeechSynthesis();
    bindEvents();
    renderSamplePhrases();
  }

  // --- STAR BACKGROUND PARTICLES ---
  function generateStarParticles() {
    if (!el.starBackground) return;
    el.starBackground.innerHTML = '';
    const starCount = 85;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star-particle';
      const size = Math.random() * 2.8 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${Math.random() * 4 + 2.5}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      el.starBackground.appendChild(star);
    }
  }

  // --- THEME HANDLING ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('star66_theme', theme);
    if (el.themeIcon) {
      el.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(message, icon = '✨') {
    if (!el.toastNotice) return;
    el.toastText.textContent = message;
    el.toastIcon.textContent = icon;
    el.toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toastNotice.classList.remove('show');
    }, 2800);
  }

  // --- AUDIO SYNTH TONES (WEB AUDIO API CHIMES) ---
  function playChime(type = 'start') {
    if (!state.soundFx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // AudioContext autoplay restrictions or disabled audio
    }
  }

  // --- QUICK CHIPS RENDERING ---
  function renderQuickChips() {
    // Source Chips
    el.srcQuickChips.innerHTML = '';
    const autoChip = createChip('auto', 'Auto', state.srcLang === 'auto', (code) => {
      setSourceLanguage(code);
    });
    el.srcQuickChips.appendChild(autoChip);

    POPULAR_CODES.slice(0, 6).forEach(code => {
      const lang = getLanguage(code);
      const chip = createChip(code, lang.name, state.srcLang === code, (selectedCode) => {
        setSourceLanguage(selectedCode);
      });
      el.srcQuickChips.appendChild(chip);
    });

    // Target Chips
    el.tgtQuickChips.innerHTML = '';
    POPULAR_CODES.slice(0, 7).forEach(code => {
      const lang = getLanguage(code);
      const chip = createChip(code, lang.name, state.tgtLang === code, (selectedCode) => {
        setTargetLanguage(selectedCode);
      });
      el.tgtQuickChips.appendChild(chip);
    });
  }

  function createChip(code, label, isActive, onClick) {
    const chip = document.createElement('button');
    chip.className = `chip-btn ${isActive ? 'active' : ''}`;
    chip.textContent = label;
    chip.addEventListener('click', () => onClick(code));
    return chip;
  }

  function updateLanguageButtons() {
    const src = getLanguage(state.srcLang);
    el.srcLangName.textContent = src.name;
    el.srcLangFlag.textContent = src.flag;

    const tgt = getLanguage(state.tgtLang);
    el.tgtLangName.textContent = tgt.name;
    el.tgtLangFlag.textContent = tgt.flag;

    const convA = getLanguage(state.convLangA);
    el.convLangAName.textContent = convA.name;
    el.convLangAFlag.textContent = convA.flag;
    el.convStatusA.textContent = `Tap to speak in ${convA.name}`;

    const convB = getLanguage(state.convLangB);
    el.convLangBName.textContent = convB.name;
    el.convLangBFlag.textContent = convB.flag;
    el.convStatusB.textContent = `Tap to speak in ${convB.name}`;

    renderQuickChips();
  }

  function setSourceLanguage(code) {
    state.srcLang = code;
    updateLanguageButtons();
    triggerTranslation();
  }

  function setTargetLanguage(code) {
    state.tgtLang = code;
    updateLanguageButtons();
    triggerTranslation();
  }

  // --- SWAP LANGUAGES ---
  function swapLanguages() {
    let newSrc = state.tgtLang;
    let newTgt = state.srcLang === 'auto' ? (state.detectedLang || 'en') : state.srcLang;

    state.srcLang = newSrc;
    state.tgtLang = newTgt;

    const currentSource = el.sourceTextInput.value.trim();
    const currentTranslation = el.translationOutputText.textContent.trim();

    if (currentTranslation && !currentTranslation.includes('Translation will appear here')) {
      el.sourceTextInput.value = currentTranslation;
    }

    updateLanguageButtons();
    triggerTranslation();
    showToast(`Swapped to ${getLanguage(newSrc).name} → ${getLanguage(newTgt).name}`);
  }

  // --- TRANSLATION API (PRIMARY + FALLBACK) ---
  async function performTranslation(text, sourceLang, targetLang) {
    if (!text || !text.trim()) {
      return { translatedText: '', detectedSource: null };
    }

    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tl = targetLang;

    // 1. Primary Engine: Google Translate GTX Endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      let translated = '';
      if (Array.isArray(data) && Array.isArray(data[0])) {
        translated = data[0].map(segment => segment[0] || '').join('');
      }

      const detected = (data && data[2]) ? data[2] : null;

      // Extract phonetics / transliteration if available
      let phonetics = '';
      if (data && data[0] && data[0].length > 1) {
        const lastPart = data[0][data[0].length - 1];
        if (Array.isArray(lastPart) && typeof lastPart[2] === 'string') {
          phonetics = lastPart[2];
        } else if (Array.isArray(lastPart) && typeof lastPart[3] === 'string') {
          phonetics = lastPart[3];
        }
      }

      return {
        translatedText: translated,
        detectedSource: detected,
        phonetics: phonetics
      };
    } catch (err) {
      console.warn('Primary translation API unreachable, trying fallback...', err);
    }

    // 2. Fallback Engine: MyMemory Translation API
    try {
      const pair = `${sl === 'auto' ? 'en' : sl}|${tl}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return {
          translatedText: data.responseData.translatedText,
          detectedSource: null,
          phonetics: ''
        };
      }
    } catch (fallbackErr) {
      console.error('All translation engines failed:', fallbackErr);
    }

    throw new Error('Unable to translate. Please check your internet connection.');
  }

  // --- TRIGGER TRANSLATION (DEBOUNCED) ---
  function triggerTranslation(immediate = false) {
    clearTimeout(state.translateDebounceTimer);

    const text = el.sourceTextInput.value.trim();
    updateWordCounts(text);

    if (!text) {
      el.translationOutputText.innerHTML = '<span class="translation-placeholder">Translation will appear here in the chosen language...</span>';
      el.phoneticsDisplay.style.display = 'none';
      el.detectedLangBadge.style.display = 'none';
      el.targetWordCount.textContent = '0 chars';
      return;
    }

    const run = async () => {
      try {
        el.translationOutputText.innerHTML = '<span style="color:var(--text-dim); font-style:italic;">Translating across world neural networks...</span>';

        const result = await performTranslation(text, state.srcLang, state.tgtLang);
        el.translationOutputText.textContent = result.translatedText;
        el.targetWordCount.textContent = `${result.translatedText.length} chars`;

        // Update phonetics if present
        if (result.phonetics) {
          el.phoneticsDisplay.textContent = `Phonetic: ${result.phonetics}`;
          el.phoneticsDisplay.style.display = 'block';
        } else {
          el.phoneticsDisplay.style.display = 'none';
        }

        // Show detected language badge
        if (state.srcLang === 'auto' && result.detectedSource) {
          state.detectedLang = result.detectedSource;
          const detected = getLanguage(result.detectedSource);
          el.detectedLangBadge.textContent = `Detected: ${detected.name}`;
          el.detectedLangBadge.style.display = 'inline-block';
        } else {
          el.detectedLangBadge.style.display = 'none';
        }

        // Save to History
        saveHistoryItem({
          sourceText: text,
          translatedText: result.translatedText,
          sourceLang: state.srcLang === 'auto' ? (state.detectedLang || 'auto') : state.srcLang,
          targetLang: state.tgtLang,
          timestamp: Date.now()
        });

        // Auto Speak Voice if enabled
        if (state.autoSpeak && !state.isRecording) {
          speakTargetVoice();
        }
      } catch (err) {
        el.translationOutputText.innerHTML = `<span style="color:#ef4444;">Translation Error: ${err.message}</span>`;
      }
    };

    if (immediate) {
      run();
    } else {
      state.translateDebounceTimer = setTimeout(run, 400);
    }
  }

  // --- SPEECH RECOGNITION (VOICE INPUT) ---
  let recognitionInstance = null;

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API not supported in this browser.');
      return;
    }

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      state.isRecording = true;
      playChime('start');
      updateMicUI(true);
      startAudioVisualizer();
    };

    recognitionInstance.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (state.activeRecordingSource === 'main') {
        if (interim) {
          el.interimSpeechBox.textContent = `Hearing: "${interim}"`;
          el.interimSpeechBox.style.display = 'block';
        }

        if (final) {
          const current = el.sourceTextInput.value.trim();
          el.sourceTextInput.value = current ? `${current} ${final}` : final;
          el.interimSpeechBox.style.display = 'none';
          triggerTranslation(true);
        }
      } else if (state.activeRecordingSource === 'convA') {
        if (final) {
          handleConversationSpeech('A', final);
        }
      } else if (state.activeRecordingSource === 'convB') {
        if (final) {
          handleConversationSpeech('B', final);
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopRecording();
      if (event.error === 'not-allowed') {
        showToast('Microphone permission blocked. Please allow mic in browser settings.', '⚠️');
      } else if (event.error === 'no-speech') {
        showToast('No speech detected. Please try again.', '🎙️');
      }
    };

    recognitionInstance.onend = () => {
      stopRecording();
    };
  }

  function startSpeechRecognition(sourceType = 'main', langCode = null) {
    if (!recognitionInstance) {
      showToast('Speech recognition not supported in this browser. Please use Chrome/Edge.', '⚠️');
      return;
    }

    if (state.isRecording) {
      stopRecording();
      return;
    }

    state.activeRecordingSource = sourceType;
    let speechLocale = 'en-US';

    if (sourceType === 'main') {
      const lang = getLanguage(state.srcLang);
      speechLocale = lang.speech || 'en-US';
    } else if (sourceType === 'convA') {
      speechLocale = getLanguage(state.convLangA).speech || 'en-US';
    } else if (sourceType === 'convB') {
      speechLocale = getLanguage(state.convLangB).speech || 'es-ES';
    }

    recognitionInstance.lang = speechLocale;

    try {
      recognitionInstance.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
      stopRecording();
    }
  }

  function stopRecording() {
    state.isRecording = false;
    playChime('stop');
    updateMicUI(false);
    stopAudioVisualizer();

    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {}
    }
  }

  function updateMicUI(isRecording) {
    if (state.activeRecordingSource === 'main') {
      if (isRecording) {
        el.mainMicBtn.classList.add('recording');
        el.voiceStatusLabel.classList.add('recording');
        el.voiceStatusText.textContent = `Listening in ${getLanguage(state.srcLang).name}... Speak now!`;
        el.srcPanelCard.classList.add('active-recording');
        el.visualizerContainer.classList.add('active');
      } else {
        el.mainMicBtn.classList.remove('recording');
        el.voiceStatusLabel.classList.remove('recording');
        el.voiceStatusText.textContent = 'Click mic or press Space to speak in any language';
        el.srcPanelCard.classList.remove('active-recording');
        el.visualizerContainer.classList.remove('active');
        el.interimSpeechBox.style.display = 'none';
      }
    } else if (state.activeRecordingSource === 'convA') {
      if (isRecording) {
        el.convMicBtnA.classList.add('recording');
        el.convStatusA.textContent = 'Listening to Person A...';
      } else {
        el.convMicBtnA.classList.remove('recording');
        el.convStatusA.textContent = `Tap to speak in ${getLanguage(state.convLangA).name}`;
      }
    } else if (state.activeRecordingSource === 'convB') {
      if (isRecording) {
        el.convMicBtnB.classList.add('recording');
        el.convStatusB.textContent = 'Listening to Person B...';
      } else {
        el.convMicBtnB.classList.remove('recording');
        el.convStatusB.textContent = `Tap to speak in ${getLanguage(state.convLangB).name}`;
      }
    }
  }

  // --- AUDIO VISUALIZER (CANVAS WAVEFORM) ---
  function startAudioVisualizer() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      state.audioStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      state.audioContext = new AudioCtx();
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 64;

      const source = state.audioContext.createMediaStreamSource(stream);
      source.connect(state.analyser);

      drawWaveform();
    }).catch(err => {
      console.warn('Visualizer mic stream denied:', err);
    });
  }

  function drawWaveform() {
    const canvas = el.audioVisualizer;
    if (!canvas || !state.analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = canvas.parentElement.clientWidth || 300;
    canvas.height = canvas.parentElement.clientHeight || 48;

    function renderFrame() {
      if (!state.isRecording) return;
      state.animFrameId = requestAnimationFrame(renderFrame);

      state.analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth + 1;
      }
    }

    renderFrame();
  }

  function stopAudioVisualizer() {
    if (state.animFrameId) {
      cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
    }

    if (state.audioStream) {
      state.audioStream.getTracks().forEach(track => track.stop());
      state.audioStream = null;
    }

    if (state.audioContext && state.audioContext.state !== 'closed') {
      try {
        state.audioContext.close();
      } catch (e) {}
      state.audioContext = null;
    }
  }

  // --- SPEECH SYNTHESIS (VOICE WAY OUTPUT) ---
  function setupSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const loadVoices = () => {
      state.availableVoices = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function speakVoice(text, langCode, onEndCallback = null) {
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = getLanguage(langCode);
    const targetTag = (lang.speech || langCode || 'en-US').toLowerCase();

    utterance.lang = targetTag;
    utterance.rate = state.speechRate;
    utterance.pitch = 1.0;

    // Pick best matching voice
    if (state.availableVoices.length > 0) {
      const exactVoice = state.availableVoices.find(v => v.lang.toLowerCase() === targetTag);
      const prefixVoice = state.availableVoices.find(v => v.lang.toLowerCase().startsWith(targetTag.split('-')[0]));
      if (exactVoice) {
        utterance.voice = exactVoice;
      } else if (prefixVoice) {
        utterance.voice = prefixVoice;
      }
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  function speakTargetVoice() {
    const text = el.translationOutputText.textContent.trim();
    if (!text || text.includes('Translation will appear here')) {
      showToast('No translated text to speak.', '⚠️');
      return;
    }

    el.speakTargetBtn.classList.add('active');
    speakVoice(text, state.tgtLang, () => {
      el.speakTargetBtn.classList.remove('active');
    });
  }

  function speakSourceVoice() {
    const text = el.sourceTextInput.value.trim();
    if (!text) {
      showToast('No original text to speak.', '⚠️');
      return;
    }

    const lang = state.srcLang === 'auto' ? (state.detectedLang || 'en') : state.srcLang;
    el.speakSourceBtn.classList.add('active');
    speakVoice(text, lang, () => {
      el.speakSourceBtn.classList.remove('active');
    });
  }

  // --- TWO-WAY CONVERSATION MODE HANDLER ---
  async function handleConversationSpeech(person, spokenText) {
    if (!spokenText || !spokenText.trim()) return;

    const isA = person === 'A';
    const src = isA ? state.convLangA : state.convLangB;
    const tgt = isA ? state.convLangB : state.convLangA;

    // Remove empty state placeholder
    if (el.convEmptyState) {
      el.convEmptyState.remove();
    }

    // Create Bubble
    const bubble = document.createElement('div');
    bubble.className = `conv-bubble ${isA ? 'left' : 'right'}`;

    const header = document.createElement('div');
    header.className = 'conv-bubble-header';
    header.innerHTML = `
      <span>${isA ? 'Person A' : 'Person B'} (${getLanguage(src).flag} ${getLanguage(src).name})</span>
      <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    const originalTextNode = document.createElement('div');
    originalTextNode.className = 'conv-bubble-text';
    originalTextNode.textContent = spokenText;

    const transNode = document.createElement('div');
    transNode.className = 'conv-bubble-translation';
    transNode.textContent = 'Translating voice...';

    const actionsNode = document.createElement('div');
    actionsNode.className = 'conv-bubble-actions';

    bubble.appendChild(header);
    bubble.appendChild(originalTextNode);
    bubble.appendChild(transNode);
    bubble.appendChild(actionsNode);

    el.conversationDialogue.appendChild(bubble);
    el.conversationDialogue.scrollTop = el.conversationDialogue.scrollHeight;

    try {
      const result = await performTranslation(spokenText, src, tgt);
      transNode.textContent = result.translatedText;

      const playBtn = document.createElement('button');
      playBtn.className = 'action-btn';
      playBtn.style.padding = '4px 10px';
      playBtn.style.fontSize = '12px';
      playBtn.innerHTML = `<span>🔊</span> Replay in ${getLanguage(tgt).name}`;
      playBtn.onclick = () => speakVoice(result.translatedText, tgt);
      actionsNode.appendChild(playBtn);

      // Auto speak to the other person in their language!
      speakVoice(result.translatedText, tgt);
    } catch (e) {
      transNode.textContent = 'Translation failed.';
    }
  }

  // --- HISTORY MANAGEMENT ---
  function saveHistoryItem(item) {
    // Avoid duplicate immediate entries
    if (state.history.length > 0 && state.history[0].sourceText === item.sourceText && state.history[0].targetLang === item.targetLang) {
      return;
    }

    state.history.unshift(item);
    if (state.history.length > 50) state.history.pop();

    localStorage.setItem('star66_history', JSON.stringify(state.history));
    updateHistoryCount();
    renderHistoryList();
  }

  function updateHistoryCount() {
    if (el.historyCount) {
      el.historyCount.textContent = state.history.length;
    }
  }

  function renderHistoryList() {
    if (!el.historyItemsList) return;
    el.historyItemsList.innerHTML = '';

    if (state.history.length === 0) {
      el.historyItemsList.innerHTML = '<div style="text-align:center; color:var(--text-dim); margin-top:40px;">No saved translations yet.</div>';
      return;
    }

    state.history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';

      const srcL = getLanguage(item.sourceLang);
      const tgtL = getLanguage(item.targetLang);

      div.innerHTML = `
        <div class="history-lang-badge">
          <span>${srcL.flag} ${srcL.name} → ${tgtL.flag} ${tgtL.name}</span>
          <span style="font-size:10px; color:var(--text-dim);">${new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="history-source-text">${escapeHTML(item.sourceText)}</div>
        <div class="history-trans-text">${escapeHTML(item.translatedText)}</div>
        <div class="history-item-actions">
          <button class="icon-btn" title="Speak translation" data-index="${index}" data-action="speak">🔊</button>
          <button class="icon-btn" title="Load into translator" data-index="${index}" data-action="load">↗</button>
          <button class="icon-btn" title="Delete" data-index="${index}" data-action="delete">✕</button>
        </div>
      `;

      div.querySelector('[data-action="speak"]').addEventListener('click', (e) => {
        e.stopPropagation();
        speakVoice(item.translatedText, item.targetLang);
      });

      div.querySelector('[data-action="load"]').addEventListener('click', (e) => {
        e.stopPropagation();
        el.sourceTextInput.value = item.sourceText;
        state.srcLang = item.sourceLang;
        state.tgtLang = item.targetLang;
        updateLanguageButtons();
        triggerTranslation(true);
        el.historyDrawer.classList.remove('open');
      });

      div.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        state.history.splice(index, 1);
        localStorage.setItem('star66_history', JSON.stringify(state.history));
        updateHistoryCount();
        renderHistoryList();
      });

      el.historyItemsList.appendChild(div);
    });
  }

  function clearAllHistory() {
    state.history = [];
    localStorage.removeItem('star66_history');
    updateHistoryCount();
    renderHistoryList();
    showToast('History cleared');
  }

  // --- LANGUAGE SELECTION MODAL ---
  function openLanguageModal(targetType) {
    state.activeModalType = targetType;
    let title = 'Select Language';
    let currentSelected = '';

    if (targetType === 'src') {
      title = 'Select Source Language (Any World Language)';
      currentSelected = state.srcLang;
    } else if (targetType === 'tgt') {
      title = 'Select Target Language (Any World Language)';
      currentSelected = state.tgtLang;
    } else if (targetType === 'convA') {
      title = 'Select Language for Person A';
      currentSelected = state.convLangA;
    } else if (targetType === 'convB') {
      title = 'Select Language for Person B';
      currentSelected = state.convLangB;
    }

    el.modalTitleText.textContent = title;
    el.langSearchInput.value = '';
    renderModalLanguages('', currentSelected);
    el.langModalOverlay.classList.add('active');
    setTimeout(() => el.langSearchInput.focus(), 100);
  }

  function renderModalLanguages(searchQuery = '', currentSelected = '') {
    el.modalLangListGrid.innerHTML = '';
    const q = searchQuery.toLowerCase().trim();

    // Include Auto Detect for Source
    if (state.activeModalType === 'src' && (!q || 'auto detect'.includes(q))) {
      const autoBtn = document.createElement('button');
      autoBtn.className = `lang-option-btn ${currentSelected === 'auto' ? 'selected' : ''}`;
      autoBtn.innerHTML = `
        <span class="flag">✨</span>
        <div class="lang-names">
          <span class="english-name">Detect Language (Auto)</span>
          <span class="native-name">Auto Detects 130+ languages</span>
        </div>
      `;
      autoBtn.onclick = () => selectModalLanguage('auto');
      el.modalLangListGrid.appendChild(autoBtn);
    }

    const filtered = WORLD_LANGUAGES.filter(l => {
      if (!q) return true;
      return l.name.toLowerCase().includes(q) ||
             l.native.toLowerCase().includes(q) ||
             l.code.toLowerCase().includes(q);
    });

    filtered.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `lang-option-btn ${currentSelected === lang.code ? 'selected' : ''}`;
      btn.innerHTML = `
        <span class="flag">${lang.flag}</span>
        <div class="lang-names">
          <span class="english-name">${lang.name}</span>
          <span class="native-name">${lang.native}</span>
        </div>
      `;
      btn.onclick = () => selectModalLanguage(lang.code);
      el.modalLangListGrid.appendChild(btn);
    });
  }

  function selectModalLanguage(code) {
    if (state.activeModalType === 'src') {
      setSourceLanguage(code);
    } else if (state.activeModalType === 'tgt') {
      setTargetLanguage(code);
    } else if (state.activeModalType === 'convA') {
      state.convLangA = code;
      updateLanguageButtons();
    } else if (state.activeModalType === 'convB') {
      state.convLangB = code;
      updateLanguageButtons();
    }
    el.langModalOverlay.classList.remove('active');
  }

  // --- SAMPLE PHRASES ---
  function renderSamplePhrases() {
    document.querySelectorAll('.phrase-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.sourceTextInput.value = chip.getAttribute('data-phrase');
        triggerTranslation(true);
      });
    });
  }

  // --- FULLSCREEN PRESENTATION ---
  function openFullscreen() {
    const text = el.translationOutputText.textContent.trim();
    if (!text || text.includes('Translation will appear here')) {
      showToast('No translated text to present.', '⚠️');
      return;
    }
    const tgt = getLanguage(state.tgtLang);
    el.fsTargetLangLabel.textContent = `${tgt.flag} ${tgt.name} Translation`;
    el.fsTranslatedText.textContent = text;
    el.fsSourceText.textContent = el.sourceTextInput.value.trim();
    el.fullscreenOverlay.classList.add('active');
  }

  // --- UTILS & EVENT BINDINGS ---
  function updateWordCounts(text) {
    const chars = text.length;
    const words = text ? text.trim().split(/\s+/).length : 0;
    el.sourceWordCount.textContent = `${chars} chars · ${words} words`;
  }

  function copyTextToClipboard(text, successMsg) {
    if (!text || text.includes('Translation will appear here')) {
      showToast('Nothing to copy', '⚠️');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, '📋');
    }).catch(() => {
      showToast('Failed to copy', '❌');
    });
  }

  function downloadTranslation() {
    const text = el.translationOutputText.textContent.trim();
    if (!text || text.includes('Translation will appear here')) {
      showToast('No translation to download.', '⚠️');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `star66_translation_${state.tgtLang}.txt`;
    a.click();
    showToast('Downloaded text file', '💾');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function bindEvents() {
    // Theme & Sound FX
    el.themeToggleBtn.addEventListener('click', toggleTheme);
    el.soundFxBtn.addEventListener('click', () => {
      state.soundFx = !state.soundFx;
      el.soundFxIcon.textContent = state.soundFx ? '🔔' : '🔕';
      showToast(state.soundFx ? 'Sound effects enabled' : 'Sound effects muted');
    });

    // History Drawer
    el.historyToggleBtn.addEventListener('click', () => {
      renderHistoryList();
      el.historyDrawer.classList.add('open');
    });
    el.closeHistoryBtn.addEventListener('click', () => el.historyDrawer.classList.remove('open'));
    el.clearHistoryBtn.addEventListener('click', clearAllHistory);

    // View Switching Tabs
    el.tabStandard.addEventListener('click', () => {
      el.tabStandard.classList.add('active');
      el.tabConversation.classList.remove('active');
      el.standardTranslatorView.style.display = 'block';
      el.conversationView.classList.remove('active');
    });

    el.tabConversation.addEventListener('click', () => {
      el.tabConversation.classList.add('active');
      el.tabStandard.classList.remove('active');
      el.standardTranslatorView.style.display = 'none';
      el.conversationView.classList.add('active');
    });

    // Dropdown Modal Triggers
    el.srcLangBtn.addEventListener('click', () => openLanguageModal('src'));
    el.tgtLangBtn.addEventListener('click', () => openLanguageModal('tgt'));
    el.swapLangBtn.addEventListener('click', swapLanguages);

    el.convLangABtn.addEventListener('click', () => openLanguageModal('convA'));
    el.convLangBBtn.addEventListener('click', () => openLanguageModal('convB'));

    // Modal Search & Close
    el.closeLangModalBtn.addEventListener('click', () => el.langModalOverlay.classList.remove('active'));
    el.langModalOverlay.addEventListener('click', (e) => {
      if (e.target === el.langModalOverlay) el.langModalOverlay.classList.remove('active');
    });
    el.langSearchInput.addEventListener('input', (e) => {
      renderModalLanguages(e.target.value);
    });

    // Main Mic Button
    el.mainMicBtn.addEventListener('click', () => {
      startSpeechRecognition('main');
    });

    // Conversation Mic Buttons
    el.convMicBtnA.addEventListener('click', () => startSpeechRecognition('convA'));
    el.convMicBtnB.addEventListener('click', () => startSpeechRecognition('convB'));

    // Text Input Events
    el.sourceTextInput.addEventListener('input', () => triggerTranslation(false));
    el.clearTextBtn.addEventListener('click', () => {
      el.sourceTextInput.value = '';
      triggerTranslation(true);
      el.sourceTextInput.focus();
    });
    el.pasteTextBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          el.sourceTextInput.value = text;
          triggerTranslation(true);
          showToast('Pasted from clipboard');
        }
      } catch (e) {
        showToast('Clipboard access required', '⚠️');
      }
    });

    // Voice & Copy Buttons
    el.speakSourceBtn.addEventListener('click', speakSourceVoice);
    el.copySourceBtn.addEventListener('click', () => copyTextToClipboard(el.sourceTextInput.value, 'Original words copied'));

    el.speakTargetBtn.addEventListener('click', speakTargetVoice);
    el.copyTargetBtn.addEventListener('click', () => copyTextToClipboard(el.translationOutputText.textContent, 'Translated words copied'));
    el.downloadTransBtn.addEventListener('click', downloadTranslation);
    el.fullscreenBtn.addEventListener('click', openFullscreen);
    el.closeFsBtn.addEventListener('click', () => el.fullscreenOverlay.classList.remove('active'));
    el.fsSpeakBtn.addEventListener('click', speakTargetVoice);

    // Voice Speed & Auto Speak
    el.autoSpeakCheckbox.addEventListener('change', (e) => {
      state.autoSpeak = e.target.checked;
      showToast(state.autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled');
    });
    el.voiceSpeedSelect.addEventListener('change', (e) => {
      state.speechRate = parseFloat(e.target.value) || 1.0;
      showToast(`Playback speed: ${state.speechRate}x`);
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Spacebar toggles mic when not inside textarea or input
      if (e.code === 'Space' && document.activeElement !== el.sourceTextInput && document.activeElement !== el.langSearchInput) {
        e.preventDefault();
        startSpeechRecognition('main');
      }
      // Escape closes modals
      if (e.key === 'Escape') {
        el.langModalOverlay.classList.remove('active');
        el.historyDrawer.classList.remove('open');
        el.fullscreenOverlay.classList.remove('active');
      }
    });
  }

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);
})();
