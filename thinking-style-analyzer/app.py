"""
Thinking Style Analyzer - Flask Backend
========================================
REST API that accepts text input, performs NLP preprocessing,
and returns thinking style classification results.
"""

import pickle
import random
import string

import numpy as np
from flask import Flask, render_template, request, jsonify
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import pypdf
import docx
import io

# ── Flask app setup ────────────────────────────────────────────────────────────

app = Flask(__name__)

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)

# ── Load trained model artifacts ───────────────────────────────────────────────

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# ── Constants ──────────────────────────────────────────────────────────────────

CATEGORIES = [
    'Logical Thinking',
    'Creative Thinking',
    'Analytical Thinking',
    'Emotional Thinking'
]

CATEGORY_DESCRIPTIONS = {
    'Logical Thinking': 'You approach problems with structured reasoning and systematic analysis.',
    'Creative Thinking': 'You see the world through a lens of imagination and innovation.',
    'Analytical Thinking': 'You rely on data, evidence, and careful examination to reach conclusions.',
    'Emotional Thinking': 'You process experiences through feelings, empathy, and human connection.'
}

SUGGESTIONS = {
    'Logical Thinking': [
        "Your systematic reasoning is a major strength. Consider exploring formal logic, philosophy, or mathematical problem-solving to sharpen it further.",
        "You excel at structured thinking. Apply frameworks like decision trees or flowcharts to complex problems for even better results.",
        "Great logical foundation! Try competitive programming or strategic board games to push your reasoning capabilities.",
        "Your methodical approach makes you a natural at debugging and troubleshooting. Consider roles in engineering or architecture.",
        "Channel your logical prowess into learning formal argumentation — it will make your communication even more persuasive."
    ],
    'Creative Thinking': [
        "Your creative mind is vibrant! Try daily journaling, mind-mapping, or brainstorming sessions to capture your best ideas.",
        "Embrace your artistic side fully. Explore cross-disciplinary creativity — blend art with technology, or music with data.",
        "Your imagination is your superpower. Learn design thinking methodology to channel creativity into practical innovation.",
        "You think in possibilities rather than limitations. Entrepreneurship and product design could be perfect outlets for your vision.",
        "Creative thinkers like you thrive in collaborative environments. Seek out hackathons, art jams, or improv workshops."
    ],
    'Analytical Thinking': [
        "Your keen analytical mind is well-suited for data science, research, or investigative journalism.",
        "Your evidence-based approach is invaluable. Deepen it with courses in statistics, machine learning, or research methodology.",
        "Great critical thinking skills! Apply them to real-world datasets — Kaggle competitions are an excellent proving ground.",
        "Your ability to decompose complex problems is rare. Consider consulting, strategy, or systems engineering roles.",
        "Analytical thinkers excel at spotting patterns others miss. Practice with puzzles, case studies, and root-cause analysis exercises."
    ],
    'Emotional Thinking': [
        "Your emotional intelligence is remarkable. Roles in counseling, human resources, or mentoring would leverage this beautifully.",
        "You connect deeply with others — a trait of great leaders. Explore empathy-driven leadership and emotional coaching.",
        "Your sensitivity to human experience is a gift. Combine it with writing, storytelling, or documentary filmmaking.",
        "Emotionally attuned thinkers thrive in collaborative teams. Your ability to read the room is invaluable in any organization.",
        "Practice mindfulness and self-reflection to deepen your emotional awareness while maintaining healthy boundaries."
    ]
}

# ── NLP Preprocessing ─────────────────────────────────────────────────────────


def preprocess_text(text):
    """
    Apply NLP preprocessing pipeline:
    1. Lowercase conversion
    2. Tokenization using NLTK
    3. Stopword removal
    4. Punctuation removal
    """
    text = text.lower()
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    tokens = [
        token for token in tokens
        if token not in string.punctuation
        and token not in stop_words
        and len(token) > 1
    ]
    return ' '.join(tokens)


def generate_summary(text, num_sentences=3):
    """
    Generate an extractive summary of the text based on word frequencies.
    """
    if not text.strip():
        return ""
    
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(text.lower())
    freq_table = dict()
    for word in words:
        if word not in stop_words and word not in string.punctuation:
            if word in freq_table:
                freq_table[word] += 1
            else:
                freq_table[word] = 1
                
    sentences = nltk.sent_tokenize(text)
    
    if len(sentences) <= num_sentences:
        return text
        
    sentence_scores = dict()
    for i, sentence in enumerate(sentences):
        score = 0
        for word in word_tokenize(sentence.lower()):
            if word in freq_table:
                score += freq_table[word]
        sentence_scores[i] = score
        
    top_sentence_indices = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    top_sentence_indices.sort()
    
    summary = " ".join([sentences[i] for i in top_sentence_indices])
    return summary


# ── Routes ─────────────────────────────────────────────────────────────────────


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/extract_text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided.'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
        
    ext = file.filename.rsplit('.', 1)[-1].lower()
    text = ""
    
    try:
        if ext == 'pdf':
            reader = pypdf.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif ext in ['doc', 'docx']:
            # docx can be parsed directly from the file object
            doc = docx.Document(file)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            return jsonify({'error': 'Unsupported file format. Please upload PDF or Word documents.'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to parse file: {str(e)}'}), 500
        
    if not text.strip():
        return jsonify({'error': 'Could not extract any meaningful text from the file.'}), 400
        
    return jsonify({'text': text.strip()})


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')

    if not text.strip():
        return jsonify({'error': 'Please enter some text to analyze.'}), 400

    if len(text.split()) < 5:
        return jsonify({'error': 'Please enter at least 5 words for a meaningful analysis.'}), 400

    processed = preprocess_text(text)

    if not processed.strip():
        return jsonify({'error': 'Not enough meaningful content after preprocessing. Try adding more descriptive words.'}), 400

    X = vectorizer.transform([processed])
    probabilities = model.predict_proba(X)[0]

    results = {}
    for i, category in enumerate(CATEGORIES):
        results[category] = round(float(probabilities[i]) * 100, 1)

    dominant_idx = int(np.argmax(probabilities))
    dominant_trait = CATEGORIES[dominant_idx]
    confidence = round(float(np.max(probabilities)) * 100, 1)
    suggestion = random.choice(SUGGESTIONS[dominant_trait])

    word_count = len(text.split())
    processed_tokens = len(processed.split())
    char_count = len(text)
    
    summary = generate_summary(text)

    return jsonify({
        'results': results,
        'dominant': dominant_trait,
        'dominant_description': CATEGORY_DESCRIPTIONS[dominant_trait],
        'confidence': confidence,
        'suggestion': suggestion,
        'word_count': word_count,
        'char_count': char_count,
        'processed_tokens': processed_tokens,
        'summary': summary
    })


if __name__ == '__main__':
    app.run(debug=True, port=5001)
