# 🧠 Thinking Style Analyzer

**AI-Powered Cognitive Pattern Recognition** using NLP and Machine Learning.

Analyzes your text and classifies your thinking style into four categories:
- 🧠 **Logical Thinking** — Structured reasoning and deduction
- 🎨 **Creative Thinking** — Imagination and innovation
- 📊 **Analytical Thinking** — Data-driven and evidence-based
- ❤️ **Emotional Thinking** — Empathy and human connection

---

## 🎥 Demo

![Demo Recording](assets/demo.webp)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd thinking-style-analyzer
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python train_model.py
```

This generates `model.pkl` and `vectorizer.pkl`.

### 3. Run the App

```bash
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

---

## 📁 Project Structure

```
thinking-style-analyzer/
├── app.py                 # Flask backend with NLP pipeline
├── train_model.py         # ML training script
├── model.pkl              # Trained classifier (generated)
├── vectorizer.pkl         # TF-IDF vectorizer (generated)
├── requirements.txt       # Python dependencies
├── README.md              # This file
├── templates/
│   └── index.html         # Main UI page
└── static/
    ├── css/
    │   └── style.css      # Glassmorphism styling
    └── js/
        └── app.js         # Frontend logic & charts
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| NLP Preprocessing | Tokenization, stopword removal, lowercasing |
| TF-IDF Vectorization | Bigram feature extraction |
| ML Classification | Logistic Regression with probability scores |
| Pie Chart | Interactive doughnut chart (Chart.js) |
| PDF Report | Downloadable analysis report (jsPDF) |
| Dark/Light Mode | Toggle with persistent preference |
| Sample Texts | 4 pre-loaded example paragraphs |
| Confidence Score | Model certainty indicator |
| Loading Animation | Neural network-themed animation |
| Responsive Design | Works on mobile and desktop |

## 🛠 Tech Stack

- **Backend:** Python, Flask, NLTK, scikit-learn
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js 4
- **PDF:** jsPDF
- **Design:** Glassmorphism, Black & White theme
