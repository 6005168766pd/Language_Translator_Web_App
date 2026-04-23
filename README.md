# ⬡ LinguaAI — AI-Powered Language Translator

> **B.Tech CSE Mini AI Project** · Helsinki-NLP Seq2Seq Transformers · Runs Fully Offline

---

## 🧠 What This Project Does

LinguaAI is a full-stack web application that translates text between 10+ languages using **real neural machine translation models** from Hugging Face (`Helsinki-NLP/opus-mt-*`). It features:

- **Auto language detection** via `langdetect`
- **Seq2Seq Transformer** models (MarianMT architecture)
- **Fully offline** after initial model download
- **Text-to-Speech** using the Web Speech API
- Swap, Copy, and Character-count features

---

## 🗂 Project Structure

```
language-translator/
├── backend/
│   ├── app.py              ← Flask REST API
│   ├── translator.py       ← Model loading & translation logic
│   └── requirements.txt    ← Python dependencies
├── frontend/
│   ├── index.html          ← Main page
│   ├── style.css           ← Dark editorial UI styles
│   └── script.js           ← API calls and UI interactions
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1 — Install Python dependencies

Make sure Python 3.9+ is installed, then:

```bash
cd backend
pip install -r requirements.txt
```

> ⚠️ PyTorch (`torch`) may take a few minutes to install. It downloads ~800 MB.

### Step 2 — Run the Flask backend

```bash
cd backend
python app.py
```

You should see:

```
 * Running on http://127.0.0.1:5000
```

> **First translation per language pair** will auto-download the Helsinki-NLP model (~300 MB each). Subsequent calls are instant (models are cached in memory).

### Step 3 — Open the frontend

Simply open `frontend/index.html` in any browser.

> If you get a CORS error, serve it using:
>
> ```bash
> cd frontend
> python -m http.server 8080
> ```
>
> Then visit `http://localhost:8080`

---

## 🌐 Supported Language Pairs

| Source  | Target  | Model Used                                           |
| ------- | ------- | ---------------------------------------------------- |
| English | French  | `opus-mt-en-fr`                                      |
| English | German  | `opus-mt-en-de`                                      |
| English | Spanish | `opus-mt-en-es`                                      |
| English | Hindi   | `opus-mt-en-hi`                                      |
| English | Arabic  | `opus-mt-en-ar`                                      |
| French  | English | `opus-mt-fr-en`                                      |
| German  | English | `opus-mt-de-en`                                      |
| Spanish | English | `opus-mt-es-en`                                      |
| ...     | ...     | Auto-pivoted via English if direct model unavailable |

> Helsinki-NLP provides **1,000+ opus-mt models** on Hugging Face Hub.

---

## 🔌 API Endpoints

### `POST /translate`

```json
Request:  { "text": "Hello world", "target_lang": "fr" }
Response: { "translated_text": "Bonjour le monde", "source_lang": "en", "target_lang": "fr" }
```

### `POST /detect`

```json
Request:  { "text": "Bonjour tout le monde" }
Response: { "detected_lang": "fr" }
```

---

## 🧪 AI/ML Concepts Demonstrated

| Concept                      | Implementation                                  |
| ---------------------------- | ----------------------------------------------- |
| **Seq2Seq Models**           | MarianMT encoder-decoder architecture           |
| **Tokenization**             | `MarianTokenizer` converts text → token IDs     |
| **Transformer Architecture** | Foundation of all Helsinki-NLP models           |
| **Model Inference**          | `model.generate()` with `torch.no_grad()`       |
| **Transfer Learning**        | Pre-trained on OPUS multilingual corpus         |
| **Language Detection**       | Statistical n-gram model via `langdetect`       |
| **Pivot Translation**        | Auto fallback via English for unsupported pairs |

---

## 📸 Expected Output

Input: `"Hello, how are you?"`  
Target: French  
Output: `"Bonjour, comment allez-vous ?"`

---

## 🛠 Tech Stack

| Layer              | Technology                                         |
| ------------------ | -------------------------------------------------- |
| AI Model           | Hugging Face `transformers` · Helsinki-NLP/opus-mt |
| Backend            | Python 3.9+ · Flask · flask-cors                   |
| Language Detection | `langdetect`                                       |
| Frontend           | HTML5 · CSS3 · Vanilla JavaScript                  |
| API Communication  | Fetch API ↔ Flask REST                             |
| Model Runtime      | PyTorch (`torch`)                                  |
| TTS                | Web Speech API (browser built-in)                  |

---

## 📋 requirements.txt

```
flask==3.0.3
flask-cors==4.0.1
transformers==4.40.2
torch==2.3.0
sentencepiece==0.2.0
langdetect==1.0.9
sacremoses==0.1.1
```

---

## 🎓 Credits

- **Helsinki-NLP** for the open-source OPUS-MT model suite
- **Hugging Face** for the `transformers` library
- **OPUS corpus** for the multilingual training data

---

_Built as a Mini AI Project for 2nd Year B.Tech CSE with AI specialization._
