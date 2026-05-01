"""
Thinking Style Analyzer - Model Training Script
=================================================
Generates synthetic training data and trains a Logistic Regression classifier
to categorize text into four thinking styles:
  0 - Logical Thinking
  1 - Creative Thinking
  2 - Analytical Thinking
  3 - Emotional Thinking

Uses TF-IDF vectorization with bigrams for feature extraction.
"""

import pickle
import random
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Seed vocabularies for each thinking style ──────────────────────────────────

LOGICAL_SEEDS = [
    "therefore", "because", "consequently", "hence", "logic", "reason",
    "deduce", "systematic", "structured", "premise", "conclude", "thus",
    "proof", "argument", "rational", "inference", "hypothesis", "valid",
    "principle", "axiom", "theorem", "implication", "follows", "deduction",
    "syllogism", "proposition", "logical", "reasoning", "framework",
    "consistent", "coherent", "derivation", "foundation", "basis",
    "if-then", "criterion", "methodology", "sequential", "causation",
    "deterministic", "formalize", "rigorous", "precise", "definitive"
]

CREATIVE_SEEDS = [
    "imagine", "create", "innovative", "design", "artistic", "inspiration",
    "vision", "novel", "unique", "dream", "explore", "invent", "creative",
    "original", "aesthetic", "beauty", "express", "art", "compose", "craft",
    "color", "paint", "story", "fantasy", "metaphor", "poetry", "muse",
    "canvas", "sculpture", "melody", "harmony", "improvise", "freeform",
    "reimagine", "transform", "whimsical", "vivid", "surreal", "abstract",
    "conceptual", "experimental", "unconventional", "brainstorm", "ideate"
]

ANALYTICAL_SEEDS = [
    "analyze", "data", "evidence", "research", "examine", "investigate",
    "evaluate", "measure", "compare", "statistics", "pattern", "methodology",
    "quantify", "calculate", "metric", "benchmark", "study", "experiment",
    "observation", "correlate", "variable", "factor", "framework", "assess",
    "systematic", "empirical", "objective", "hypothesis", "control",
    "sample", "survey", "regression", "outlier", "significance", "trend",
    "dataset", "parameter", "frequency", "distribution", "probability",
    "findings", "diagnostic", "decompose", "scrutinize", "classify"
]

EMOTIONAL_SEEDS = [
    "feel", "love", "happy", "emotion", "heart", "passion", "empathy",
    "care", "joy", "fear", "hope", "grateful", "compassion", "warmth",
    "sorrow", "excitement", "tender", "cherish", "trust", "bond",
    "affection", "sentiment", "mood", "inspire", "soul", "deep",
    "yearning", "bliss", "melancholy", "nostalgia", "serenity", "elation",
    "vulnerability", "kindness", "devotion", "longing", "gratitude",
    "heartfelt", "touching", "moving", "uplifting", "bittersweet",
    "intimate", "nurture", "comfort", "embrace", "radiant"
]

FILLER_WORDS = [
    "the", "a", "is", "are", "was", "were", "have", "has", "been",
    "this", "that", "these", "those", "can", "could", "would", "should",
    "will", "may", "might", "must", "very", "also", "often", "always",
    "when", "where", "how", "what", "which", "who", "people", "things",
    "way", "life", "world", "time", "work", "think", "know", "make",
    "important", "understand", "need", "see", "find", "use", "help",
    "consider", "approach", "process", "develop", "involve", "require",
    "about", "through", "between", "within", "across", "beyond",
    "together", "around", "along", "toward", "during", "before", "after"
]

# ── Sentence templates for more natural text ───────────────────────────────────

LOGICAL_TEMPLATES = [
    "If we consider the {seed1} carefully, then the {seed2} clearly {seed3} that the conclusion is valid.",
    "The {seed1} of this {seed2} suggests that we must {seed3} our approach based on sound {seed4}.",
    "Based on this {seed1}, we can {seed2} that the {seed3} is {seed4} and well-founded.",
    "It {seed1} from the given {seed2} that a {seed3} approach yields the most {seed4} results.",
    "The {seed1} behind this {seed2} is built on {seed3} and {seed4} principles.",
    "We must {seed1} our {seed2} using {seed3} to reach a {seed4} outcome.",
]

CREATIVE_TEMPLATES = [
    "Let us {seed1} a world where {seed2} and {seed3} come together in {seed4} ways.",
    "The {seed1} behind this {seed2} reflects a truly {seed3} and {seed4} perspective.",
    "Through {seed1} and {seed2}, we can {seed3} something entirely {seed4}.",
    "Every {seed1} is a chance to {seed2} and bring {seed3} {seed4} to life.",
    "The {seed1} of {seed2} thinking allows us to {seed3} beyond the {seed4}.",
    "We should {seed1} freely and let our {seed2} guide us toward {seed3} {seed4}.",
]

ANALYTICAL_TEMPLATES = [
    "The {seed1} from our {seed2} shows a clear {seed3} that we need to {seed4} further.",
    "By {seed1} the {seed2} against our {seed3}, we can {seed4} the root cause.",
    "Our {seed1} reveals that the {seed2} are {seed3} with previous {seed4}.",
    "We need to {seed1} each {seed2} and {seed3} the {seed4} carefully.",
    "The {seed1} {seed2} indicates a strong {seed3} between these {seed4}.",
    "Through careful {seed1} and {seed2}, we can {seed3} the key {seed4}.",
]

EMOTIONAL_TEMPLATES = [
    "I {seed1} deeply {seed2} for the {seed3} and {seed4} that fills our lives.",
    "The {seed1} of human {seed2} reminds us to {seed3} every {seed4} moment.",
    "When we {seed1} with {seed2}, we create {seed3} that bring {seed4}.",
    "There is something {seed1} about the way {seed2} can {seed3} our {seed4}.",
    "My {seed1} overflows with {seed2} when I see such {seed3} and {seed4}.",
    "We should {seed1} each other with {seed2} and {seed3}, spreading {seed4}.",
]


def generate_templated_sample(seeds, templates):
    """Generate a sample using templates + random seed words."""
    template = random.choice(templates)
    selected = random.sample(seeds, min(4, len(seeds)))
    mapping = {f"seed{i+1}": w for i, w in enumerate(selected)}
    sentence = template.format(**mapping)
    # Add some filler context
    extra_seeds = random.sample(seeds, random.randint(2, 5))
    extra_fillers = random.sample(FILLER_WORDS, random.randint(3, 8))
    extra = " ".join(extra_seeds + extra_fillers)
    return sentence + " " + extra


def generate_random_sample(seeds, min_words=20, max_words=50):
    """Generate a purely random word-bag sample."""
    n_words = random.randint(min_words, max_words)
    n_seed = random.randint(4, min(10, n_words // 2))
    n_filler = n_words - n_seed
    words = random.choices(seeds, k=n_seed) + random.choices(FILLER_WORDS, k=n_filler)
    random.shuffle(words)
    return " ".join(words)


def generate_dataset(n_per_class=400):
    """Generate balanced dataset with mixed generation strategies."""
    all_seeds = [LOGICAL_SEEDS, CREATIVE_SEEDS, ANALYTICAL_SEEDS, EMOTIONAL_SEEDS]
    all_templates = [LOGICAL_TEMPLATES, CREATIVE_TEMPLATES, ANALYTICAL_TEMPLATES, EMOTIONAL_TEMPLATES]
    
    texts = []
    labels = []
    
    for label_idx, (seeds, templates) in enumerate(zip(all_seeds, all_templates)):
        for i in range(n_per_class):
            if i % 2 == 0:
                text = generate_templated_sample(seeds, templates)
            else:
                text = generate_random_sample(seeds)
            texts.append(text)
            labels.append(label_idx)
    
    return texts, labels


def train():
    """Train the thinking style classifier and save artifacts."""
    random.seed(42)
    np.random.seed(42)
    
    print("=" * 60)
    print("  Thinking Style Analyzer - Model Training")
    print("=" * 60)
    
    # Generate dataset
    print("\n📊 Generating synthetic training data...")
    texts, labels = generate_dataset(n_per_class=400)
    print(f"   Total samples: {len(texts)}")
    print(f"   Samples per class: {len(texts) // 4}")
    
    # TF-IDF Vectorization
    print("\n🔤 Applying TF-IDF vectorization...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english',
        min_df=2,
        max_df=0.95,
        sublinear_tf=True
    )
    X = vectorizer.fit_transform(texts)
    print(f"   Feature matrix shape: {X.shape}")
    print(f"   Vocabulary size: {len(vectorizer.vocabulary_)}")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"\n   Training samples: {X_train.shape[0]}")
    print(f"   Testing samples:  {X_test.shape[0]}")
    
    # Train Logistic Regression
    print("\n🤖 Training Logistic Regression classifier...")
    model = LogisticRegression(
        max_iter=1000,

        solver='lbfgs',
        C=1.0,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    label_names = ['Logical', 'Creative', 'Analytical', 'Emotional']
    
    print("\n📈 Classification Report:")
    print("-" * 60)
    print(classification_report(y_test, y_pred, target_names=label_names))
    
    # Accuracy
    accuracy = model.score(X_test, y_test)
    print(f"   Overall Accuracy: {accuracy:.2%}")
    
    # Save model and vectorizer
    print("\n💾 Saving model artifacts...")
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("   ✅ model.pkl saved")
    
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    print("   ✅ vectorizer.pkl saved")
    
    # Quick demo
    print("\n" + "=" * 60)
    print("  Quick Demo - Sample Predictions")
    print("=" * 60)
    
    demo_texts = [
        "If we consider the logical premise, then the rational conclusion follows that systematic reasoning leads to valid deductions.",
        "Imagine a vibrant canvas of creative dreams where artistic visions come to life through original expression.",
        "The statistical data from our research study reveals significant patterns that require further empirical analysis.",
        "I feel deeply grateful for the love and warmth that fills my heart with joy and compassion every day."
    ]
    
    for text in demo_texts:
        X_demo = vectorizer.transform([text])
        probs = model.predict_proba(X_demo)[0]
        pred = label_names[np.argmax(probs)]
        print(f"\n   Text: \"{text[:70]}...\"")
        print(f"   Prediction: {pred} ({np.max(probs):.1%} confidence)")
        for name, prob in zip(label_names, probs):
            bar = "█" * int(prob * 30)
            print(f"     {name:12s}: {prob:6.1%} {bar}")
    
    print("\n✅ Training complete! You can now run: python app.py\n")


if __name__ == '__main__':
    train()
