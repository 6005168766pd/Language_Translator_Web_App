from transformers import MarianMTModel, MarianTokenizer
from langdetect import detect, DetectorFactory
import torch

# Make language detection deterministic
DetectorFactory.seed = 0

# Language code mapping (langdetect -> Helsinki model codes)
LANG_CODE_MAP = {
    "en": "en",
    "fr": "fr",
    "de": "de",
    "es": "es",
    "it": "it",
    "hi": "hi",
    "ar": "ar",
    "zh-cn": "zh",
    "zh-tw": "zh",
    "pt": "pt",
    "ru": "ru",
    "ja": "jap",
    "nl": "nl",
}

# Cache loaded models to avoid reloading
model_cache = {}

def detect_language(text: str):
    """Detect language of input text using langdetect."""
    try:
        lang = detect(text)
        return LANG_CODE_MAP.get(lang, lang)
    except Exception as e:
        print(f"[detect_language] Error: {e}")
        return None

def get_model_name(src: str, tgt: str):
    """Return the Helsinki-NLP model name for a given language pair."""
    return f"Helsinki-NLP/opus-mt-{src}-{tgt}"

def load_model(model_name: str):
    """Load and cache a MarianMT model and tokenizer."""
    if model_name in model_cache:
        return model_cache[model_name]
    print(f"[load_model] Loading model: {model_name}")
    try:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        model.eval()
        model_cache[model_name] = (tokenizer, model)
        return tokenizer, model
    except Exception as e:
        print(f"[load_model] Failed to load {model_name}: {e}")
        return None, None

def translate_text(text: str, src_lang: str, tgt_lang: str) -> dict:
    """Translate text from src_lang to tgt_lang using Helsinki-NLP."""
    model_name = get_model_name(src_lang, tgt_lang)
    tokenizer, model = load_model(model_name)

    if tokenizer is None or model is None:
        # Try pivot through English if direct model unavailable
        if src_lang != "en":
            print(f"[translate_text] Direct model not found. Trying pivot via English.")
            pivot = translate_text(text, src_lang, "en")
            if "error" in pivot:
                return {"error": f"No translation model available for {src_lang} → {tgt_lang}"}
            return translate_text(pivot["translated_text"], "en", tgt_lang)
        return {"error": f"No translation model available for {src_lang} → {tgt_lang}"}

    try:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            translated = model.generate(**inputs)
        result = tokenizer.decode(translated[0], skip_special_tokens=True)
        return {"translated_text": result}
    except Exception as e:
        return {"error": str(e)}