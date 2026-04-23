from flask import Flask, request, jsonify
from flask_cors import CORS
from translator import translate_text, detect_language

app = Flask(__name__)
CORS(app)  # Allow frontend to call the backend

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Language Translator API is running!"})

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()

    if not data or "text" not in data or "target_lang" not in data:
        return jsonify({"error": "Missing 'text' or 'target_lang' in request body"}), 400

    text = data["text"].strip()
    target_lang = data["target_lang"]

    if not text:
        return jsonify({"error": "Input text cannot be empty"}), 400

    # Auto-detect source language
    detected_lang = detect_language(text)
    if detected_lang is None:
        return jsonify({"error": "Could not detect source language"}), 400

    if detected_lang == target_lang:
        return jsonify({
            "translated_text": text,
            "source_lang": detected_lang,
            "target_lang": target_lang,
            "message": "Source and target language are the same."
        })

    result = translate_text(text, detected_lang, target_lang)

    if "error" in result:
        return jsonify(result), 500

    return jsonify({
        "translated_text": result["translated_text"],
        "source_lang": detected_lang,
        "target_lang": target_lang
    })

@app.route("/detect", methods=["POST"])
def detect():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text'"}), 400
    lang = detect_language(data["text"])
    return jsonify({"detected_lang": lang})

if __name__ == "__main__":
    app.run(debug=False, port=5000)