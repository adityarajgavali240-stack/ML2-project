/**
 * Cognitive Style AI — Professional Frontend Logic
 * =================================================
 */

// ── Icons (Professional SVGs) ────────────────────────────────
const ICONS = {
  'Logical Thinking': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M12 8v3"/></svg>`,
  'Creative Thinking': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  'Analytical Thinking': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  'Emotional Thinking': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
};

const COLORS = {
  'Logical Thinking': 'var(--bar-logical)',
  'Creative Thinking': 'var(--bar-creative)',
  'Analytical Thinking': 'var(--bar-analytical)',
  'Emotional Thinking': 'var(--bar-emotional)'
};

// ── Sample Texts ─────────────────────────────────────────────
const SAMPLES = [
  `If we consider the fundamental premise that effective decision-making requires a structured framework, then it logically follows that every step in the process must be validated against established criteria. The rational approach demands that we systematically evaluate each option, drawing inferences from available evidence before reaching a well-founded conclusion. Therefore, by applying deductive reasoning and maintaining consistency in our methodology, we can ensure that our final decision is both sound and defensible.`,

  `Imagine a world painted in colors that haven't been named yet — where every sunrise composes a new melody and every shadow tells a forgotten story. Creativity isn't just about making art; it's about reimagining the ordinary until it becomes extraordinary. I dream of designing experiences that blend the surreal with the familiar, crafting original narratives that invite people to explore beyond the boundaries of convention and discover beauty in the unexpected.`,

  `Based on the data collected across three independent research studies, there is a statistically significant correlation between the measured variables. Our analytical framework identifies key patterns when we decompose the dataset by demographic factors. The regression model yields a p-value below 0.01, and the effect size suggests practical significance. By systematically evaluating each parameter against our benchmark metrics and controlling for confounding variables, we can draw robust conclusions.`,

  `I feel an overwhelming sense of gratitude when I think about the people who have touched my heart with their kindness and compassion. There is something deeply moving about genuine human connection — the warmth of a friend's embrace, the joy of shared laughter, the tender comfort of knowing someone truly cares. My soul finds peace in nurturing these bonds of love and trust, and I hope to spread this warmth wherever life takes me.`
];

// ── DOM Elements ─────────────────────────────────────────────
const elements = {
  textInput: document.getElementById('text-input'),
  analyzeBtn: document.getElementById('analyze-btn'),
  sampleBtn: document.getElementById('sample-btn'),
  clearBtn: document.getElementById('clear-btn'),
  charCount: document.getElementById('char-count'),
  wordCount: document.getElementById('word-count-display'),
  loadingSection: document.getElementById('loading-section'),
  errorSection: document.getElementById('error-section'),
  errorMessage: document.getElementById('error-message'),
  resultsSection: document.getElementById('results-section'),
  themeToggle: document.getElementById('theme-toggle'),
  downloadBtn: document.getElementById('download-btn'),
  newAnalysisBtn: document.getElementById('new-analysis-btn'),
  fileUpload: document.getElementById('file-upload'),
  summaryText: document.getElementById('summary-text'),
  micBtn: document.getElementById('mic-btn'),
  micText: document.getElementById('mic-text')
};

let pieChart = null;
let lastResults = null;
let sampleIndex = 0;

// ── Initialization ───────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('tsa-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

elements.themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tsa-theme', next);
  if (pieChart) updateChartColors();
});

// ── Text Input Handlers ──────────────────────────────────────
elements.textInput.addEventListener('input', () => {
  const text = elements.textInput.value;
  elements.charCount.textContent = `${text.length} / 5000`;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  elements.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  elements.analyzeBtn.disabled = words < 5;
});

elements.sampleBtn.addEventListener('click', () => {
  elements.textInput.value = SAMPLES[sampleIndex % SAMPLES.length];
  sampleIndex++;
  elements.textInput.dispatchEvent(new Event('input'));
  elements.textInput.focus();
});

elements.clearBtn.addEventListener('click', () => {
  elements.textInput.value = '';
  elements.textInput.dispatchEvent(new Event('input'));
  elements.resultsSection.classList.add('hidden');
  elements.errorSection.classList.add('hidden');
  elements.textInput.focus();
});

elements.newAnalysisBtn.addEventListener('click', () => {
  elements.resultsSection.classList.add('hidden');
  elements.textInput.value = '';
  elements.textInput.dispatchEvent(new Event('input'));
  document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
  elements.textInput.focus();
});

elements.fileUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  elements.errorSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.loadingSection.classList.remove('hidden');
  document.getElementById('loading-text').textContent = 'Extracting text from file...';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/extract_text', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Failed to extract text from file.');
    } else {
      elements.textInput.value = data.text;
      elements.textInput.dispatchEvent(new Event('input'));
    }
  } catch (err) {
    showError('Failed to connect to the server. Ensure backend is running.');
  } finally {
    elements.loadingSection.classList.add('hidden');
    elements.fileUpload.value = ''; // reset input
  }
});

// ── Web Speech API ───────────────────────────────────────────
let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    elements.micText.textContent = 'Stop';
    elements.micBtn.style.color = '#ff4757';
    elements.micBtn.style.borderColor = '#ff4757';
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      const currentText = elements.textInput.value.trim();
      elements.textInput.value = currentText ? currentText + ' ' + finalTranscript.trim() : finalTranscript.trim();
      elements.textInput.dispatchEvent(new Event('input'));
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    stopRecording();
    showError('Microphone error: ' + event.error);
  };

  recognition.onend = () => {
    stopRecording();
  };
} else {
  if (elements.micBtn) elements.micBtn.style.display = 'none';
}

function stopRecording() {
  isRecording = false;
  elements.micText.textContent = 'Record';
  elements.micBtn.style.color = '';
  elements.micBtn.style.borderColor = '';
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
}

elements.micBtn.addEventListener('click', () => {
  if (!recognition) {
    showError('Speech Recognition is not supported in your browser.');
    return;
  }
  
  if (isRecording) {
    stopRecording();
  } else {
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  }
});

// ── Analysis Logic ───────────────────────────────────────────
elements.analyzeBtn.addEventListener('click', runAnalysis);
elements.textInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !elements.analyzeBtn.disabled) {
    runAnalysis();
  }
});

async function runAnalysis() {
  const text = elements.textInput.value.trim();
  if (!text) return;

  elements.errorSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.loadingSection.classList.remove('hidden');
  elements.analyzeBtn.disabled = true;

  const loadingTexts = [
    'Tokenizing input syntax...',
    'Filtering linguistic noise...',
    'Applying TF-IDF transformation...',
    'Executing ML classification...',
    'Aggregating confidence scores...'
  ];
  const loadingTextEl = document.getElementById('loading-text');
  let step = 0;
  const loadingInterval = setInterval(() => {
    step = (step + 1) % loadingTexts.length;
    loadingTextEl.textContent = loadingTexts[step];
  }, 500);

  try {
    const res = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    clearInterval(loadingInterval);

    if (!res.ok) {
      showError(data.error || 'An error occurred during analysis.');
      return;
    }

    lastResults = { ...data, originalText: text };
    displayResults(data);

  } catch (err) {
    clearInterval(loadingInterval);
    showError('Failed to connect to the server. Ensure backend is running.');
  } finally {
    elements.loadingSection.classList.add('hidden');
    elements.analyzeBtn.disabled = false;
  }
}

function showError(msg) {
  elements.errorMessage.textContent = msg;
  elements.errorSection.classList.remove('hidden');
  elements.loadingSection.classList.add('hidden');
}

// ── Display Results ──────────────────────────────────────────
function displayResults(data) {
  // Update DOM elements
  document.getElementById('dominant-icon').innerHTML = ICONS[data.dominant];
  document.getElementById('dominant-trait').textContent = data.dominant;
  document.getElementById('dominant-description').textContent = data.dominant_description;
  document.getElementById('confidence-value').textContent = data.confidence + '%';

  document.getElementById('stat-words').textContent = data.word_count;
  document.getElementById('stat-chars').textContent = data.char_count;
  document.getElementById('stat-tokens').textContent = data.processed_tokens;
  document.getElementById('suggestion-text').textContent = data.suggestion;
  elements.summaryText.textContent = data.summary;

  renderBars(data.results);
  renderPieChart(data.results);

  elements.resultsSection.classList.remove('hidden');

  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function renderBars(results) {
  const container = document.getElementById('score-bars');
  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  container.innerHTML = '';

  sorted.forEach(([label, value]) => {
    const shortLabel = label.replace(' Thinking', '');
    const icon = ICONS[label] || '';
    const color = COLORS[label] || 'var(--accent)';
    
    const item = document.createElement('div');
    item.className = 'score-bar-item';
    item.innerHTML = `
      <div class="score-bar-header">
        <span class="score-bar-label">${icon} ${shortLabel}</span>
        <span class="score-bar-value">${value}%</span>
      </div>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="background: ${color};"></div>
      </div>
    `;
    container.appendChild(item);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.querySelector('.score-bar-fill').style.width = value + '%';
      });
    });
  });
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark
    ? ['#e2e2e2', '#a3a3a3', '#737373', '#404040']
    : ['#1a1a1a', '#4d4d4d', '#808080', '#b3b3b3'];
}

function renderPieChart(results) {
  const ctx = document.getElementById('pie-chart').getContext('2d');
  if (pieChart) pieChart.destroy();

  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(i => i[0].replace(' Thinking', ''));
  const values = sorted.map(i => i[1]);
  const colors = getChartColors();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f0f0f0' : '#111111';
  const borderColor = isDark ? 'rgba(20, 20, 22, 1)' : 'rgba(255, 255, 255, 1)';

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: borderColor,
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
            padding: 20,
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
          }
        }
      },
      animation: { animateRotate: true, duration: 1500, easing: 'easeOutQuart' }
    }
  });
}

function updateChartColors() {
  if (!pieChart || !lastResults) return;
  renderPieChart(lastResults.results);
}

// ── PDF Download ─────────────────────────────────────────────
elements.downloadBtn.addEventListener('click', generatePDF);

function generatePDF() {
  try {
    if (!lastResults) return;

    const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    if (!jsPDF) throw new Error("jsPDF library failed to load");
    const doc = new jsPDF();
    const d = lastResults;
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Cognitive Style Analysis', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, y, { align: 'center' });
    y += 15;

    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 15;

    // Primary Trait
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Primary Trait:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${d.dominant} (${d.confidence}% Confidence)`, 60, y);
    y += 15;

    // Distribution
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cognitive Distribution', 20, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const sorted = Object.entries(d.results).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([label, value]) => {
      doc.text(`${label.replace(' Thinking', '')}: ${value}%`, 25, y);
      doc.setFillColor(230, 230, 230);
      doc.rect(80, y - 4, 90, 5, 'F');
      doc.setFillColor(60, 60, 60);
      doc.rect(80, y - 4, (value / 100) * 90, 5, 'F');
      y += 10;
    });
    y += 10;

    // Insights
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Strategic Insights', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const suggLines = doc.splitTextToSize(d.suggestion, 160);
    doc.text(suggLines, 25, y);
    y += suggLines.length * 6 + 10;
    
    // check page break
    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Text Summary', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(d.summary, 160);
    doc.text(summaryLines, 25, y);
    y += summaryLines.length * 6 + 10;
    
    // check page break
    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    // Input Text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Analyzed Text', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80);
    const textLines = doc.splitTextToSize(d.originalText, 160);
    doc.text(textLines.slice(0, 20), 25, y); // Print up to 20 lines

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Cognitive.AI Platform — Advanced NLP Analysis', 105, 285, { align: 'center' });

    doc.save('cognitive-style-report.pdf');
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Error generating PDF: " + error.message);
  }
}

initTheme();
