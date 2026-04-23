// ============================================================
// LinguaAI — Frontend Script (Glassmorphism Edition)
// ============================================================

const API_BASE = "http://localhost:5000";

// ---- DOM ----
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const clearBtn = document.getElementById("clearBtn");
const swapBtn = document.getElementById("swapBtn");
const charCount = document.getElementById("charCount");
const charFill = document.getElementById("charFill");
const copyBtn = document.getElementById("copyBtn");
const speakSrcBtn = document.getElementById("speakSourceBtn");
const speakOutBtn = document.getElementById("speakOutputBtn");
const detectedFlag = document.getElementById("detectedFlag");
const detectedName = document.getElementById("detectedLangName");
const detectedBox = document.getElementById("detectedBox");
const modelTag = document.getElementById("modelTag");
const btnSpinner = document.getElementById("btnSpinner");
const btnLabel = document.getElementById("btnLabel");
const toast = document.getElementById("toast");

// ---- Language meta ----
const LANGS = {
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "French", flag: "🇫🇷" },
  de: { name: "German", flag: "🇩🇪" },
  es: { name: "Spanish", flag: "🇪🇸" },
  it: { name: "Italian", flag: "🇮🇹" },
  pt: { name: "Portuguese", flag: "🇵🇹" },
  hi: { name: "Hindi", flag: "🇮🇳" },
  ar: { name: "Arabic", flag: "🇸🇦" },
  ru: { name: "Russian", flag: "🇷🇺" },
  nl: { name: "Dutch", flag: "🇳🇱" },
  jap: { name: "Japanese", flag: "🇯🇵" },
  zh: { name: "Chinese", flag: "🇨🇳" },
};

// ---- State ----
let lastDetectedCode = null;
let lastTranslation = "";
let detectTimer = null;

// ---- Character counter ----
inputText.addEventListener("input", () => {
  const len = inputText.value.length;
  charCount.textContent = len;
  const pct = (len / 1000) * 100;
  charFill.style.width = pct + "%";
  charFill.className = "char-progress" + (len > 800 ? " warn" : "");

  clearTimeout(detectTimer);
  if (len > 4) {
    detectTimer = setTimeout(() => autoDetect(inputText.value), 500);
  } else {
    resetDetected();
  }
});

function resetDetected() {
  detectedFlag.textContent = "🌐";
  detectedName.textContent = "Auto Detecting…";
  detectedBox.classList.remove("detected");
  lastDetectedCode = null;
}

// ---- Auto detect ----
async function autoDetect(text) {
  try {
    const res = await fetch(`${API_BASE}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.detected_lang) setDetected(data.detected_lang);
  } catch { /* silent fail */ }
}

function setDetected(code) {
  lastDetectedCode = code;
  const meta = LANGS[code];
  detectedFlag.textContent = meta ? meta.flag : "🌐";
  detectedName.textContent = meta ? meta.name : code.toUpperCase();
  detectedBox.classList.add("detected");
}

// ---- Translate ----
translateBtn.addEventListener("click", doTranslate);
inputText.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "Enter") doTranslate();
});

async function doTranslate() {
  const text = inputText.value.trim();
  if (!text) { showToast("Please enter some text first.", "error"); return; }

  const tgt = targetLang.value;
  setLoading(true);

  // Clear output
  outputText.innerHTML = "";
  outputText.classList.add("translating");
  outputText.classList.remove("has-text");

  let success = false;

  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_lang: tgt })
    });

    // Check if response is ok before parsing
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();

    outputText.classList.remove("translating");

    if (data.error) {
      outputText.innerHTML = `<span style="color:#f5576c">⚠ ${data.error}</span>`;
      showToast(data.error, "error");
    } else {
      success = true;
      lastTranslation = data.translated_text;
      outputText.classList.add("has-text");
      typeReveal(data.translated_text);

      if (data.source_lang) setDetected(data.source_lang);

      // Update model badge
      const src = data.source_lang || "?";
      modelTag.innerHTML = `<span class="badge-dot"></span> Helsinki-NLP/opus-mt-${src}-${tgt}`;
      showToast("Translation complete! ✓", "success");
    }

  } catch (err) {
    // Only show error if translation did NOT succeed
    if (!success) {
      outputText.classList.remove("translating");
      outputText.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon" style="font-size:1.5rem">⚠</div>
          <p class="empty-title" style="color:#f5576c">Backend Unreachable</p>
          <p class="empty-sub">Make sure Flask is running on <strong>localhost:5000</strong></p>
        </div>`;
      showToast("Cannot reach backend", "error");
      console.error("Fetch error:", err);
    }
  } finally {
    setLoading(false);
  }
}

function typeReveal(text) {
  outputText.textContent = "";
  let i = 0;
  const speed = Math.max(8, Math.min(25, 1200 / text.length));
  const iv = setInterval(() => {
    outputText.textContent += text[i++];
    if (i >= text.length) clearInterval(iv);
  }, speed);
}

function setLoading(on) {
  translateBtn.classList.toggle("loading", on);
  translateBtn.disabled = on;
  btnLabel.textContent = on ? "Translating…" : "Translate Now";
  btnSpinner.style.display = on ? "block" : "none";
}

// ---- Clear ----
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  charCount.textContent = "0";
  charFill.style.width = "0%";
  charFill.className = "char-progress";
  outputText.classList.remove("has-text", "translating");
  outputText.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">✦</div>
      <p class="empty-title">Ready to translate</p>
      <p class="empty-sub">Select a target language and hit Translate</p>
    </div>`;
  lastTranslation = "";
  modelTag.innerHTML = `<span class="badge-dot"></span> Helsinki-NLP/opus-mt`;
  resetDetected();
  inputText.focus();
});

// ---- Swap ----
swapBtn.addEventListener("click", () => {
  if (!lastTranslation) { showToast("Nothing to swap yet!", "error"); return; }
  const detectedCode = lastDetectedCode;
  inputText.value = lastTranslation;
  charCount.textContent = lastTranslation.length;
  charFill.style.width = ((lastTranslation.length / 1000) * 100) + "%";

  outputText.classList.remove("has-text");
  outputText.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">✦</div>
      <p class="empty-title">Ready to translate</p>
      <p class="empty-sub">Click Translate Now</p>
    </div>`;
  lastTranslation = "";

  if (detectedCode) {
    const opt = [...targetLang.options].find(o => o.value === detectedCode);
    if (opt) targetLang.value = detectedCode;
  }
  autoDetect(inputText.value);
  showToast("Languages swapped!", "success");
});

// ---- Copy ----
copyBtn.addEventListener("click", async () => {
  if (!lastTranslation) { showToast("Nothing to copy yet!", "error"); return; }
  try {
    await navigator.clipboard.writeText(lastTranslation);
    showToast("Copied to clipboard! ✓", "success");
  } catch {
    showToast("Copy failed — try manually.", "error");
  }
});

// ---- TTS ----
// ---- TTS ----
speakSrcBtn.addEventListener("click", () => speakText(inputText.value, lastDetectedCode || "en"));
speakOutBtn.addEventListener("click", () => speakText(lastTranslation, targetLang.value));

function speakText(text, langCode) {
  if (!text) { showToast("Nothing to speak!", "error"); return; }
  if (!("speechSynthesis" in window)) { showToast("TTS not supported.", "error"); return; }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 1;
  utt.volume = 1;

  // Wait for voices to load, then speak
  function doSpeak() {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      // Voices not ready yet, retry after 200ms
      setTimeout(doSpeak, 200);
      return;
    }

    // Try to find a matching voice for the language
    const match =
      voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase())) ||
      voices.find(v => v.lang.startsWith("en")) || // fallback to English
      voices[0]; // fallback to first available

    if (match) utt.voice = match;

    // Chrome bug fix — cancel and re-speak after tiny delay
    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.speak(utt);
    }, 100);
  }

  doSpeak();
  showToast("Speaking…", "success");
}

// Pre-load voices on page load
if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    window.speechSynthesis.getVoices(); // cache them
  });
}