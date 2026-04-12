/**
 * quiz.js — Interactive cybersecurity quiz with 10 questions
 * CyberAware Cybersecurity Education Platform
 *
 * Features:
 * - 10 cybersecurity questions with 4 options each
 * - Instant feedback with explanations after each answer
 * - Score tracking with localStorage persistence
 * - Accessible: ARIA live regions, keyboard navigable
 * - Results review table
 * - No inline JS — all event listeners attached here
 */

'use strict';

(function () {

  /* ═══════════════════════════════════════════════════
     QUESTION BANK (10 questions)
  ═══════════════════════════════════════════════════ */
  const QUESTIONS = [
    {
      id: 1,
      question: 'What does HTTPS stand for, and what does it protect against?',
      options: [
        'HyperText Transfer Protocol Secure — encrypts data in transit to prevent eavesdropping',
        'HyperText Transfer Protocol Standard — a newer version of HTTP with faster loading',
        'Hyperlink Transfer Protocol System — protects your files from being downloaded',
        'High-Traffic Transfer Protocol Secure — only used on government websites'
      ],
      correct: 0,
      explanation: 'HTTPS (HyperText Transfer Protocol Secure) uses TLS/SSL to encrypt communication between your browser and the server. It prevents man-in-the-middle attacks, eavesdropping, and data tampering. The padlock icon in your browser confirms HTTPS is active.'
    },
    {
      id: 2,
      question: 'What is phishing?',
      options: [
        'A technique to speed up network traffic by caching DNS entries',
        'A cyberattack where attackers impersonate trusted entities (emails/sites) to steal credentials',
        'A type of encryption used to protect passwords',
        'A programming vulnerability that allows SQL injection'
      ],
      correct: 1,
      explanation: 'Phishing is a social engineering attack where attackers create fake emails, websites, or messages that appear to be from legitimate sources (banks, social media, etc.) to trick victims into revealing passwords, credit card numbers, or other sensitive data.'
    },
    {
      id: 3,
      question: 'What does DNS stand for, and what is its primary function?',
      options: [
        'Dynamic Network System — assigns IP addresses automatically to devices',
        'Data Name Service — manages user authentication on websites',
        'Domain Name System — translates human-readable domain names (like google.com) into IP addresses',
        'Digital Naming Standard — creates unique identifiers for web servers'
      ],
      correct: 2,
      explanation: 'DNS (Domain Name System) acts as the internet\'s phonebook. When you type "google.com" your browser queries a DNS resolver which returns the IP address (e.g., 142.250.80.46) so your browser knows where to send its HTTP request.'
    },
    {
      id: 4,
      question: 'Which of the following is an example of Cross-Site Scripting (XSS)?',
      options: [
        'An attacker logging into your account with a stolen password',
        'An attacker sending you a fake email pretending to be your bank',
        'An attacker injecting <script>alert("hacked")</script> into a website\'s comment field',
        'An attacker intercepting your Wi-Fi traffic at a coffee shop'
      ],
      correct: 2,
      explanation: 'XSS (Cross-Site Scripting) occurs when an attacker injects malicious JavaScript into a webpage that other users then load in their browsers. This can steal cookies, redirect users, or modify page content. Prevention: escape user output, use Content Security Policy.'
    },
    {
      id: 5,
      question: 'What is a CSRF (Cross-Site Request Forgery) attack?',
      options: [
        'An attack that overwhelms a server with too many requests (DDoS)',
        'An attack that tricks a logged-in user into submitting a request they didn\'t intend',
        'An attack where credentials are guessed by trying common passwords',
        'An attack that reads cookies stored on your browser'
      ],
      correct: 1,
      explanation: 'CSRF tricks a user\'s browser into making an unintended request to a site they\'re already logged into. For example, a malicious website could trigger a bank transfer using your active session. Defence: CSRF tokens (random values tied to your session that a malicious site can\'t access).'
    },
    {
      id: 6,
      question: 'What is SQL Injection?',
      options: [
        'A technique for speeding up database queries with indexes',
        'A type of malicious input that manipulates SQL queries to gain unauthorized database access',
        'A method of encrypting database passwords using SHA-256',
        'A network protocol used to synchronise database servers'
      ],
      correct: 1,
      explanation: 'SQL Injection occurs when an attacker inserts malicious SQL code into an input field. For example: entering " \' OR \'1\'=\'1" as a username can bypass login. Prevention: always use parameterised queries or prepared statements — never string-concatenate user input into SQL.'
    },
    {
      id: 7,
      question: 'What is the best practice for storing user passwords?',
      options: [
        'Store them in plain text — it\'s the most readable format for developers',
        'Encrypt them with AES-256 and store the encryption key in the same database',
        'Hash them using bcrypt, Argon2, or scrypt with a unique salt per user',
        'Convert them to Base64 encoding for storage'
      ],
      correct: 2,
      explanation: 'Passwords should be hashed using a slow, salted hashing algorithm like bcrypt or Argon2. Salting prevents rainbow table attacks. Never store plain text passwords or use fast hashes (MD5, SHA-1) — these can be cracked quickly. Base64 is encoding, not encryption — it\'s trivially reversible.'
    },
    {
      id: 8,
      question: 'What does a content security policy (CSP) in the HTTP header do?',
      options: [
        'Compresses JavaScript files to improve page loading speed',
        'Restricts which sources browsers can load scripts, styles, and media from — reducing XSS risk',
        'Encrypts cookies so they cannot be read by third-party scripts',
        'Prevents SQL injection by blocking database queries from the browser'
      ],
      correct: 1,
      explanation: 'A Content Security Policy (CSP) is an HTTP response header that tells browsers which content sources are trusted. For example: Content-Security-Policy: script-src \'self\' means only scripts from your own domain are allowed. This dramatically reduces XSS impact by blocking inline scripts and untrusted sources.'
    },
    {
      id: 9,
      question: 'What differentiates client-side vulnerabilities from server-side vulnerabilities?',
      options: [
        'Client-side vulnerabilities affect only the browser\'s appearance; server-side affects performance',
        'Client-side vulnerabilities (XSS, CSRF) exploit users\' browsers; server-side (SQLi, RCE) exploit the server itself',
        'Client-side vulnerabilities are reported to W3C; server-side are reported to NIST',
        'There is no meaningful difference — all web vulnerabilities are the same category'
      ],
      correct: 1,
      explanation: 'Client-side vulnerabilities (XSS, clickjacking, CSRF) attack the user\'s browser or session. Server-side vulnerabilities (SQL injection, command injection, broken auth) attack the server directly, often allowing access to databases or system commands. Both require separate, layered defences.'
    },
    {
      id: 10,
      question: 'Which HTTP method is most appropriate for a search query, and why?',
      options: [
        'POST — because it hides the search term from the URL for privacy',
        'DELETE — because search results remove items from the server',
        'GET — because searches are idempotent read-only operations that can be bookmarked and cached',
        'PUT — because you are updating the search index on the server'
      ],
      correct: 2,
      explanation: 'GET requests are appropriate for read-only, idempotent operations like searches. The query appears in the URL (allowing bookmarking and caching) and has no side effects. POST is for creating/submitting data with side effects. Using GET for search is also important for accessibility — screen readers and crawlers can follow GET links easily.'
    }
  ];

  /* ═══════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════ */
  let currentIndex  = 0;
  let score         = 0;
  let answered      = false;
  let userAnswers   = []; // Track user's answers for review table

  /* ═══════════════════════════════════════════════════
     DOM REFERENCES
  ═══════════════════════════════════════════════════ */
  const quizStart       = document.getElementById('quizStart');
  const quizGame        = document.getElementById('quizGame');
  const quizResults     = document.getElementById('quizResults');
  const startBtn        = document.getElementById('startQuizBtn');
  const retakeBtn       = document.getElementById('retakeBtn');
  const nextBtn         = document.getElementById('nextQuestionBtn');
  const questionEl      = document.getElementById('quizQuestion');
  const optionsEl       = document.getElementById('quizOptions');
  const explanationEl   = document.getElementById('quizExplanation');
  const progressFill    = document.getElementById('progressFill');
  const progressBar     = document.querySelector('.quiz-progress-bar');
  const scoreDisplay    = document.getElementById('scoreDisplay');
  const questionCounter = document.getElementById('questionCounter');
  const finalScore      = document.getElementById('finalScoreDisplay');
  const resultTitle     = document.getElementById('resultTitle');
  const resultMessage   = document.getElementById('resultMessage');
  const scoreRing       = document.getElementById('scoreRing');
  const reviewBody      = document.getElementById('reviewTableBody');
  const bestScoreDisplay = document.getElementById('bestScoreDisplay');
  const bestScoreVal     = document.getElementById('bestScoreVal');

  // Guard: quiz elements must exist
  if (!quizStart || !startBtn) return;

  /* ═══════════════════════════════════════════════════
     LOCAL STORAGE — Best Score
  ═══════════════════════════════════════════════════ */
  const STORAGE_KEY = 'cyberaware_best_score';

  function getBestScore() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val !== null ? parseInt(val, 10) : null;
    } catch (e) {
      return null; // localStorage may be blocked (private mode)
    }
  }

  function saveBestScore(newScore) {
    try {
      const current = getBestScore();
      if (current === null || newScore > current) {
        localStorage.setItem(STORAGE_KEY, String(newScore));
      }
    } catch (e) {
      // Silent fail — localStorage blocked
    }
  }

  // Show best score if exists
  const best = getBestScore();
  if (best !== null && bestScoreDisplay && bestScoreVal) {
    bestScoreDisplay.style.display = 'block';
    bestScoreVal.textContent = `${best} / ${QUESTIONS.length}`;
  }

  /* ═══════════════════════════════════════════════════
     RENDER QUESTION
  ═══════════════════════════════════════════════════ */
  /**
   * Renders the current question and its answer options.
   * Updates progress bar and question counter.
   */
  function renderQuestion() {
    const q = QUESTIONS[currentIndex];
    answered = false;

    // Update meta
    questionCounter.textContent = `Question ${currentIndex + 1} of ${QUESTIONS.length}`;

    // Update progress
    const progressPercent = (currentIndex / QUESTIONS.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(currentIndex));
    }

    // Render question text
    questionEl.textContent = q.question;

    // Clear options
    optionsEl.innerHTML = '';

    // Render options
    const LETTERS = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (optText, idx) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('aria-label', `Option ${LETTERS[idx]}: ${optText}`);

      btn.innerHTML = `
        <span class="option-letter" aria-hidden="true">${LETTERS[idx]}</span>
        <span>${escapeHTML(optText)}</span>
      `;

      // Click handler
      btn.addEventListener('click', function () {
        if (!answered) selectAnswer(idx, q);
      });

      // Keyboard: Enter and Space already trigger click on buttons
      optionsEl.appendChild(btn);
    });

    // Hide explanation and next button
    explanationEl.classList.remove('visible');
    explanationEl.textContent = '';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════════
     HANDLE ANSWER SELECTION
  ═══════════════════════════════════════════════════ */
  /**
   * Called when a user selects an answer option.
   * Marks correct/wrong, shows explanation, updates score.
   * @param {number} selectedIdx - The index of the selected option
   * @param {Object} q - The current question object
   */
  function selectAnswer(selectedIdx, q) {
    answered = true;
    const options = optionsEl.querySelectorAll('.quiz-option');

    const isCorrect = selectedIdx === q.correct;
    if (isCorrect) score++;

    // Track answer for review
    userAnswers.push({
      question: q.question,
      selected: q.options[selectedIdx],
      correct: q.options[q.correct],
      isCorrect: isCorrect
    });

    // Style all options: mark correct and wrong
    options.forEach(function (btn, idx) {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('is-correct');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('is-wrong');
      }
    });

    // Update score display
    scoreDisplay.textContent = `Score: ${score}`;

    // Show explanation
    explanationEl.innerHTML = `
      <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${escapeHTML(q.explanation)}
    `;
    explanationEl.classList.add('visible');

    // Show next button (or finish button on last question)
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = currentIndex < QUESTIONS.length - 1
        ? 'Next Question →'
        : 'See Results →';
      nextBtn.focus();
    }
  }

  /* ═══════════════════════════════════════════════════
     RESULTS SCREEN
  ═══════════════════════════════════════════════════ */
  /**
   * Shows the results screen with score, ring animation, and review table.
   */
  function showResults() {
    quizGame.style.display   = 'none';
    quizResults.style.display = 'block';

    const pct = Math.round((score / QUESTIONS.length) * 100);

    // Animate score ring using CSS custom property
    if (scoreRing) {
      scoreRing.style.setProperty('--score-percent', `${pct}%`);
    }
    if (finalScore) finalScore.textContent = `${score}/${QUESTIONS.length}`;

    // Result message based on score
    let title, message;
    if (score === QUESTIONS.length) {
      title   = '🏆 Perfect Score!';
      message = 'Outstanding! You got every question correct. You have a strong grasp of cybersecurity fundamentals.';
    } else if (score >= 8) {
      title   = '🎉 Excellent Work!';
      message = `You scored ${score}/10. You clearly understand most web security concepts. Review the questions you missed.`;
    } else if (score >= 6) {
      title   = '👍 Good Effort!';
      message = `You scored ${score}/10. A solid base! Revisit the Learn section to strengthen your weaker areas.`;
    } else if (score >= 4) {
      title   = '📚 Keep Learning';
      message = `You scored ${score}/10. Don't worry — cybersecurity takes time. Check out the Learn page for in-depth explanations.`;
    } else {
      title   = '🔄 Room to Grow';
      message = `You scored ${score}/10. Start with the Learn section to build your foundation, then retake the quiz.`;
    }

    if (resultTitle)   resultTitle.textContent = title;
    if (resultMessage) resultMessage.textContent = message;

    // Save best score
    saveBestScore(score);

    // Build review table
    if (reviewBody) {
      reviewBody.innerHTML = '';
      userAnswers.forEach(function (ans, i) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${escapeHTML(ans.question.substring(0, 60))}…</td>
          <td style="color: ${ans.isCorrect ? 'var(--clr-green-400)' : 'var(--clr-red-400)'}">
            ${escapeHTML(ans.selected)}
          </td>
          <td>${ans.isCorrect ? '✅' : '❌'}</td>
        `;
        reviewBody.appendChild(row);
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     START QUIZ
  ═══════════════════════════════════════════════════ */
  function startQuiz() {
    currentIndex = 0;
    score        = 0;
    userAnswers  = [];
    answered     = false;

    quizStart.style.display   = 'none';
    quizResults.style.display = 'none';
    quizGame.style.display    = 'block';

    if (scoreDisplay) scoreDisplay.textContent = 'Score: 0';

    renderQuestion();
  }

  /* ═══════════════════════════════════════════════════
     EVENT LISTENERS
  ═══════════════════════════════════════════════════ */
  startBtn.addEventListener('click', startQuiz);

  if (retakeBtn) {
    retakeBtn.addEventListener('click', startQuiz);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentIndex++;
      if (currentIndex < QUESTIONS.length) {
        renderQuestion();
      } else {
        showResults();
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     UTILITY — HTML Escape (XSS prevention)
  ═══════════════════════════════════════════════════ */
  /**
   * Escapes HTML special characters to prevent XSS when inserting text as HTML.
   * @param {string} str - Raw string to escape
   * @returns {string} - HTML-safe string
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
