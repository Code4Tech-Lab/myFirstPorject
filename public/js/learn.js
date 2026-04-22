/**
 * learn.js — Lesson data, sidebar navigation, content rendering, XSS lab
 * CyberAware Cybersecurity Education Platform
 *
 * Features:
 * - 10 lessons stored as data (no server needed)
 * - Sidebar navigation with active state
 * - Lesson card grid with tag filtering
 * - Previous/Next navigation
 * - XSS demonstration (vulnerable vs safe)
 * - Accordion interactivity
 * - All content rendered safely (textContent, not innerHTML for user input)
 */

'use strict';

(function () {

  /* ═══════════════════════════════════════════════════
     LESSONS DATA
  ═══════════════════════════════════════════════════ */
  const LESSONS = [
    {
      id: 'http-https',
      title: 'HTTP vs HTTPS',
      icon: '🔒',
      tag: 'beginner',
      tagLabel: 'Beginner',
      summary: 'Understand the difference between HTTP and HTTPS, how TLS works, and why the padlock matters.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--beginner">Beginner</span>
          <h2 style="margin-top: var(--space-3);">HTTP vs HTTPS</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>HTTP (HyperText Transfer Protocol)</strong> is the foundation of data communication on the web.
            When you visit a website, your browser sends HTTP requests to a server, which responds with HTML, CSS, JavaScript, and images.
          </p>
          <h3>The Problem with Plain HTTP</h3>
          <p>
            HTTP sends data in <strong>plain text</strong>. This means anyone who can intercept your network traffic
            (e.g., on a public Wi-Fi network) can read your login credentials, credit card numbers, and any other data you send.
            This is called a <strong>Man-in-the-Middle (MITM) attack</strong>.
          </p>
          <h3>How HTTPS Fixes This</h3>
          <p>
            HTTPS adds <strong>TLS (Transport Layer Security)</strong> on top of HTTP. TLS:
          </p>
          <ul>
            <li>Encrypts all data exchanged between your browser and the server</li>
            <li>Authenticates the server using a digital <strong>SSL/TLS certificate</strong></li>
            <li>Ensures data integrity — no one can tamper with the data in transit</li>
          </ul>
          <h3>The Padlock Icon 🔒</h3>
          <p>
            The padlock in your browser's address bar means the connection is encrypted with HTTPS.
            However, it does <em>not</em> mean the website itself is safe — a phishing site can also use HTTPS.
            Always verify the domain name carefully.
          </p>
          <h3>TLS Handshake (Simplified)</h3>
          <ul>
            <li>Browser says "Hello" to server and lists supported cipher suites</li>
            <li>Server responds with its <strong>certificate</strong> (containing its public key)</li>
            <li>Browser verifies the certificate against trusted Certificate Authorities (CAs)</li>
            <li>A shared <strong>session key</strong> is established for symmetric encryption</li>
            <li>All subsequent traffic is encrypted with this session key</li>
          </ul>
        </div>
      `
    },
    {
      id: 'dns',
      title: 'How DNS Works',
      icon: '🌐',
      tag: 'beginner',
      tagLabel: 'Beginner',
      summary: 'Learn how DNS resolves domain names to IP addresses and what DNS attacks look like.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--beginner">Beginner</span>
          <h2 style="margin-top: var(--space-3);">How DNS Works</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>DNS (Domain Name System)</strong> is the internet's phonebook. Computers communicate using IP addresses
            (like <code>93.184.216.34</code>), but humans prefer names like <code>example.com</code>.
            DNS bridges this gap.
          </p>
          <h3>DNS Resolution Steps</h3>
          <ul>
            <li>1. Browser checks its local cache for the IP</li>
            <li>2. If not cached, queries the <strong>Recursive Resolver</strong> (your ISP or 8.8.8.8)</li>
            <li>3. Resolver queries a <strong>Root Nameserver</strong> (knows who handles .com, .org, etc.)</li>
            <li>4. Root directs to the <strong>TLD Nameserver</strong> (.com nameserver)</li>
            <li>5. TLD directs to the <strong>Authoritative Nameserver</strong> for that specific domain</li>
            <li>6. Authoritative server returns the IP address</li>
            <li>7. Browser connects to that IP and sends its HTTP request</li>
          </ul>
          <h3>DNS Security Risks</h3>
          <ul>
            <li><strong>DNS Spoofing / Cache Poisoning:</strong> Attackers inject false DNS records so users are redirected to malicious IPs</li>
            <li><strong>DNS Hijacking:</strong> Malware modifies your router's DNS settings</li>
            <li><strong>DNS over HTTPS (DoH):</strong> Encrypts DNS queries so ISPs and attackers can't see which sites you're looking up</li>
          </ul>
        </div>
      `
    },
    {
      id: 'phishing',
      title: 'Phishing Attacks',
      icon: '🎣',
      tag: 'beginner',
      tagLabel: 'Beginner',
      summary: 'Recognise phishing emails, fake websites, and social engineering tactics used to steal credentials.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--beginner">Beginner</span>
          <h2 style="margin-top: var(--space-3);">Phishing Attacks</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>Phishing</strong> is a social engineering attack where criminals impersonate trusted entities
            (banks, social media, IT departments) to trick victims into revealing sensitive information.
          </p>
          <h3>Types of Phishing</h3>
          <ul>
            <li><strong>Email Phishing:</strong> Mass emails with urgent calls to action ("Your account will be suspended!")</li>
            <li><strong>Spear Phishing:</strong> Targeted attack on a specific person, using personal details to seem legitimate</li>
            <li><strong>Whaling:</strong> Spear phishing targeting executives or high-value individuals</li>
            <li><strong>Smishing:</strong> Phishing via SMS (e.g., "Your parcel is waiting, click here")</li>
            <li><strong>Vishing:</strong> Voice phishing — phone calls pretending to be tech support</li>
          </ul>
          <h3>Red Flags to Watch For</h3>
          <ul>
            <li>Sender email domain doesn't match the organisation (e.g., support@paypa1.com)</li>
            <li>Urgent language: "Act NOW or lose access"</li>
            <li>Generic greeting: "Dear Customer" instead of your name</li>
            <li>Suspicious links (hover to preview URL before clicking)</li>
            <li>Unexpected attachments (especially .exe, .docm, .xlsm)</li>
          </ul>
          <h3>How to Protect Yourself</h3>
          <ul>
            <li>Enable <strong>Multi-Factor Authentication (MFA)</strong> on all accounts</li>
            <li>Verify by calling the organisation directly on a known number</li>
            <li>Never click links in emails — navigate directly to the site</li>
            <li>Use a <strong>password manager</strong> — it won't autofill on fake sites</li>
          </ul>
        </div>
      `
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      icon: '💉',
      tag: 'intermediate',
      tagLabel: 'Intermediate',
      summary: 'How attackers inject malicious scripts into web pages and how to prevent XSS vulnerabilities.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--intermediate">Intermediate</span>
          <h2 style="margin-top: var(--space-3);">Cross-Site Scripting (XSS)</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>XSS (Cross-Site Scripting)</strong> is a vulnerability where attackers inject malicious JavaScript
            into web pages viewed by other users. It's one of OWASP's Top 10 most critical web vulnerabilities.
          </p>
          <h3>Types of XSS</h3>
          <ul>
            <li><strong>Stored XSS:</strong> Malicious script saved to database (e.g., in a comment), executes for every visitor</li>
            <li><strong>Reflected XSS:</strong> Script embedded in a URL, executes when victim clicks the crafted link</li>
            <li><strong>DOM-based XSS:</strong> Script manipulates the page's DOM client-side without server involvement</li>
          </ul>
          <h3>What Attackers Can Do with XSS</h3>
          <ul>
            <li>Steal session cookies (bypassing login)</li>
            <li>Redirect users to phishing pages</li>
            <li>Log keystrokes (capture passwords)</li>
            <li>Modify page content to spread misinformation</li>
            <li>Perform actions on behalf of the user (if combined with CSRF)</li>
          </ul>
          <h3>Prevention</h3>
          <ul>
            <li><strong>Output encoding:</strong> Escape &lt;, &gt;, &amp;, "  when inserting data into HTML</li>
            <li><strong>Use textContent not innerHTML</strong> when inserting user data into the DOM</li>
            <li><strong>Content Security Policy (CSP):</strong> HTTP header restricting script sources</li>
            <li><strong>HttpOnly cookies:</strong> Prevents JavaScript from reading session cookies</li>
            <li>See the Security Lab on this page for a live demonstration!</li>
          </ul>
        </div>
      `
    },
    {
      id: 'csrf',
      title: 'CSRF Attacks',
      icon: '🔄',
      tag: 'intermediate',
      tagLabel: 'Intermediate',
      summary: 'Cross-Site Request Forgery — how attackers forge requests using your active sessions.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--intermediate">Intermediate</span>
          <h2 style="margin-top: var(--space-3);">CSRF Attacks</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>CSRF (Cross-Site Request Forgery)</strong> tricks a logged-in user into submitting
            an unintended request to a web application where they're authenticated.
          </p>
          <h3>How It Works</h3>
          <ul>
            <li>You log into your bank at bank.com (browser stores session cookie)</li>
            <li>Without logging out, you visit a malicious site</li>
            <li>The malicious site contains hidden HTML that auto-submits a form to bank.com</li>
            <li>Your browser sends the request <em>with your session cookie automatically included</em></li>
            <li>Bank.com sees a valid authenticated request and processes the transfer</li>
          </ul>
          <h3>Prevention Techniques</h3>
          <ul>
            <li><strong>CSRF Tokens:</strong> Random secret per session included in forms. Server validates it — malicious site can't access it (Same-Origin Policy)</li>
            <li><strong>SameSite Cookies:</strong> Cookie attribute Strict or Lax prevents cross-site request cookies</li>
            <li><strong>Origin/Referer Header Validation:</strong> Server checks the request origin</li>
            <li><strong>Double Submit Cookie:</strong> Token sent in both cookie and form field</li>
          </ul>
        </div>
      `
    },
    {
      id: 'sql-injection',
      title: 'SQL Injection',
      icon: '🗃️',
      tag: 'intermediate',
      tagLabel: 'Intermediate',
      summary: 'How SQL injection allows attackers to manipulate databases, and how parameterised queries prevent it.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--intermediate">Intermediate</span>
          <h2 style="margin-top: var(--space-3);">SQL Injection</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>SQL Injection</strong> occurs when user input is concatenated directly into SQL queries,
            allowing attackers to manipulate the database. It's been in OWASP Top 10 since the beginning.
          </p>
          <h3>Classic Example</h3>
          <p>A login form with this vulnerable back-end code:</p>
          <pre class="code-block"><code>// ❌ VULNERABLE — never do this
query = "SELECT * FROM users WHERE username='"
        + username + "' AND password='" + password + "'";

// Attacker enters username: admin'--
// Result: SELECT * FROM users WHERE username='admin'--' AND password=...
// The -- comments out the password check — login bypassed!</code></pre>
          <h3>What Attackers Can Do</h3>
          <ul>
            <li>Bypass authentication (login as any user)</li>
            <li>Dump entire database contents (<code>UNION SELECT</code>)</li>
            <li>Delete or modify data (<code>DROP TABLE</code>)</li>
            <li>In some configs: execute OS commands</li>
          </ul>
          <h3>Prevention</h3>
          <pre class="code-block"><code>// ✅ SAFE — parameterised query (Python example)
cursor.execute(
  "SELECT * FROM users WHERE username=%s AND password=%s",
  (username, password_hash)  # Parameters are escaped by the database driver
)</code></pre>
          <ul>
            <li>Always use <strong>parameterised queries</strong> or an ORM</li>
            <li>Never concatenate user input into SQL strings</li>
            <li>Apply <strong>principle of least privilege</strong> — DB user shouldn't have DROP access</li>
            <li>Use a WAF (Web Application Firewall) as additional layer</li>
          </ul>
        </div>
      `
    },
    {
      id: 'passwords',
      title: 'Password Security',
      icon: '🔑',
      tag: 'beginner',
      tagLabel: 'Beginner',
      summary: 'Best practices for strong passwords, hashing, salting, and why NOT to use MD5.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--beginner">Beginner</span>
          <h2 style="margin-top: var(--space-3);">Password Security</h2>
        </div>
        <div class="lesson-body">
          <p>Passwords are the first line of defence for most accounts. Poor password handling — either by users or developers — is responsible for a huge number of breaches.</p>
          <h3>For Users — Strong Passwords</h3>
          <ul>
            <li>Use at least 16 characters</li>
            <li>Use a mix of uppercase, lowercase, numbers, and symbols</li>
            <li>Never reuse passwords across sites</li>
            <li>Use a <strong>password manager</strong> (Bitwarden, 1Password) to generate and store strong unique passwords</li>
            <li>Enable <strong>MFA</strong> wherever available — even a leaked password won't compromise the account</li>
          </ul>
          <h3>For Developers — Storing Passwords</h3>
          <ul>
            <li><strong>Never store plain text</strong> — if the database is breached, all passwords are exposed</li>
            <li><strong>Never use MD5 or SHA-1</strong> — these are fast hashes crackable in seconds with GPU rigs</li>
            <li>Use <strong>bcrypt, Argon2, or scrypt</strong> — slow algorithms designed for password hashing</li>
            <li>Always add a unique <strong>salt</strong> per user — prevents rainbow table attacks</li>
          </ul>
          <pre class="code-block"><code>// ✅ Correct (Node.js + bcrypt)
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12; // Work factor — higher = slower (more secure)
const hash = await bcrypt.hash(plaintextPassword, SALT_ROUNDS);
// Store 'hash' in database — never the original password</code></pre>
        </div>
      `
    },
    {
      id: 'accessibility',
      title: 'Web Accessibility (WCAG)',
      icon: '♿',
      tag: 'concept',
      tagLabel: 'Concept',
      summary: 'WCAG guidelines, semantic HTML, ARIA roles, and why accessibility is a security issue too.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--concept">Concept</span>
          <h2 style="margin-top: var(--space-3);">Web Accessibility (WCAG)</h2>
        </div>
        <div class="lesson-body">
          <p>
            <strong>WCAG (Web Content Accessibility Guidelines)</strong> ensure websites are usable by people with
            disabilities. Level AA compliance is the standard for most organisations.
          </p>
          <h3>Core Principles (POUR)</h3>
          <ul>
            <li><strong>Perceivable:</strong> Info must be presentable in ways users can perceive (alt text, captions)</li>
            <li><strong>Operable:</strong> All functionality reachable by keyboard, enough time to read</li>
            <li><strong>Understandable:</strong> Text is readable, pages behave predictably, error prevention</li>
            <li><strong>Robust:</strong> Content works with current and future assistive tech</li>
          </ul>
          <h3>Key Requirements This Project Meets</h3>
          <ul>
            <li>Skip navigation link for keyboard users</li>
            <li>All images have alt text (or aria-hidden="true" if decorative)</li>
            <li>All form inputs have &lt;label&gt; elements</li>
            <li>Visible focus indicators on all interactive elements</li>
            <li>ARIA live regions for dynamic content (quiz feedback, form alerts)</li>
            <li>Colour contrast ≥ 4.5:1 for all text</li>
            <li>Semantic HTML5 landmark elements throughout</li>
          </ul>
          <h3>Why Accessibility Overlaps with Security</h3>
          <p>Accessible forms with proper labels and error messages prevent users from making mistakes that could expose their data. Clear navigation prevents phishing confusion. Good UX reduces the risk of users ignoring security warnings.</p>
        </div>
      `
    },
    {
      id: 'client-server',
      title: 'Client–Server Architecture',
      icon: '🖥️',
      tag: 'concept',
      tagLabel: 'Concept',
      summary: 'How browsers and servers communicate, HTTP request/response cycle, status codes.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--concept">Concept</span>
          <h2 style="margin-top: var(--space-3);">Client–Server Architecture</h2>
        </div>
        <div class="lesson-body">
          <p>
            The web operates on a <strong>client–server model</strong>. Your browser (client) makes requests;
            the server processes them and returns responses.
          </p>
          <h3>HTTP Request Anatomy</h3>
          <pre class="code-block"><code>GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 (Chrome/...)
Accept: text/html
Cookie: session_id=abc123  &lt;-- SENSITIVE: encrypted by HTTPS</code></pre>
          <h3>HTTP Response Anatomy</h3>
          <pre class="code-block"><code>HTTP/1.1 200 OK
Content-Type: text/html
Set-Cookie: session=xyz; HttpOnly; Secure; SameSite=Strict
Content-Security-Policy: default-src 'self'

&lt;html&gt;...page content...&lt;/html&gt;</code></pre>
          <h3>Common HTTP Status Codes</h3>
          <ul>
            <li><strong>200 OK</strong> — Request succeeded</li>
            <li><strong>301/302</strong> — Redirect (permanent/temporary)</li>
            <li><strong>400 Bad Request</strong> — Client sent invalid data</li>
            <li><strong>401 Unauthorised</strong> — Authentication required</li>
            <li><strong>403 Forbidden</strong> — Authenticated but not authorised</li>
            <li><strong>404 Not Found</strong> — Resource doesn't exist</li>
            <li><strong>500 Internal Server Error</strong> — Server-side bug</li>
          </ul>
          <h3>Security-Relevant Headers</h3>
          <ul>
            <li><code>Strict-Transport-Security</code> — Forces HTTPS</li>
            <li><code>Content-Security-Policy</code> — Restricts script sources</li>
            <li><code>X-Content-Type-Options: nosniff</code> — Prevents MIME sniffing</li>
            <li><code>X-Frame-Options: DENY</code> — Prevents clickjacking</li>
          </ul>
        </div>
      `
    },
    {
      id: 'session-security',
      title: 'Sessions & Cookies',
      icon: '🍪',
      tag: 'advanced',
      tagLabel: 'Advanced',
      summary: 'How sessions work, secure cookie attributes, session fixation, and session hijacking prevention.',
      content: `
        <div class="lesson-header">
          <span class="lesson-tag tag--advanced">Advanced</span>
          <h2 style="margin-top: var(--space-3);">Sessions & Cookies</h2>
        </div>
        <div class="lesson-body">
          <p>
            HTTP is <strong>stateless</strong> — each request is independent. Sessions allow servers to
            remember who you are between requests.
          </p>
          <h3>How Sessions Work</h3>
          <ul>
            <li>User logs in → Server creates a session record and generates a random <strong>session ID</strong></li>
            <li>Session ID is sent to browser as a <strong>cookie</strong></li>
            <li>Browser sends cookie automatically on every subsequent request</li>
            <li>Server looks up session ID in its database to authenticate the request</li>
          </ul>
          <h3>Secure Cookie Attributes</h3>
          <pre class="code-block"><code>Set-Cookie: session_id=abc123;
  HttpOnly;    // JS cannot read this cookie — prevents XSS cookie theft
  Secure;      // Only sent over HTTPS — prevents interception
  SameSite=Strict; // Not sent on cross-site requests — prevents CSRF
  Path=/;
  Max-Age=3600 // Expires after 1 hour</code></pre>
          <h3>Session Attacks</h3>
          <ul>
            <li><strong>Session Hijacking:</strong> Attacker steals your session ID (via XSS, packet sniffing) and impersonates you</li>
            <li><strong>Session Fixation:</strong> Attacker sets a known session ID before you log in, then uses it after</li>
            <li><strong>Prevention:</strong> Regenerate session ID on login, use HttpOnly+Secure cookies, implement session timeout</li>
          </ul>
          <h3>JWT vs Session Cookies</h3>
          <p>
            JWTs (JSON Web Tokens) are stateless alternatives to sessions.
            <strong>Do NOT store JWTs in localStorage</strong> — they're accessible to JavaScript and vulnerable to XSS.
            Use httpOnly cookies instead.
          </p>
        </div>
      `
    }
  ];

  /* ═══════════════════════════════════════════════════
     LESSON GRID (overview cards)
  ═══════════════════════════════════════════════════ */
  const lessonGrid = document.getElementById('lessonGrid');
  if (lessonGrid) {
    lessonGrid.innerHTML = '';
    LESSONS.forEach(function (lesson, idx) {
      const card = document.createElement('article');
      card.className = 'lesson-card';
      card.setAttribute('aria-label', lesson.title);
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <span class="lesson-tag tag--${lesson.tag}">${lesson.tagLabel}</span>
        <h3 style="margin: var(--space-3) 0 var(--space-2);">${lesson.icon} ${lesson.title}</h3>
        <p style="font-size: var(--text-sm);">${lesson.summary}</p>
        <button class="card-link" data-lesson-idx="${idx}" style="margin-top: var(--space-4); background:none; border:none; cursor:pointer;">
          Read Lesson →
        </button>
      `;
      card.querySelector('button').addEventListener('click', function () {
        showLesson(idx);
        document.getElementById('lesson-view').scrollIntoView({ behavior: 'smooth' });
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          showLesson(idx);
          document.getElementById('lesson-view').scrollIntoView({ behavior: 'smooth' });
        }
      });
      lessonGrid.appendChild(card);
    });
  }

  /* ═══════════════════════════════════════════════════
     SIDEBAR NAVIGATION
  ═══════════════════════════════════════════════════ */
  const sidebarNav = document.getElementById('sidebarNav');
  if (sidebarNav) {
    sidebarNav.innerHTML = '';
    LESSONS.forEach(function (lesson, idx) {
      const btn = document.createElement('button');
      btn.className = `sidebar-link ${idx === 0 ? 'active' : ''}`;
      btn.setAttribute('data-lesson-idx', String(idx));
      btn.setAttribute('aria-label', `Go to lesson: ${lesson.title}`);
      btn.innerHTML = `<span class="sidebar-dot" aria-hidden="true"></span>${lesson.icon} ${lesson.title}`;
      btn.addEventListener('click', function () {
        showLesson(idx);
      });
      sidebarNav.appendChild(btn);
    });
  }

  /* ═══════════════════════════════════════════════════
     LESSON CONTENT RENDERING
  ═══════════════════════════════════════════════════ */
  let currentLessonIdx = 0;

  /**
   * Renders a lesson by its index.
   * The lesson content HTML is trusted (comes from our own data object, not user input).
   * @param {number} idx
   */
  function showLesson(idx) {
    if (idx < 0 || idx >= LESSONS.length) return;
    currentLessonIdx = idx;

    const lessonContent = document.getElementById('lessonContent');
    if (!lessonContent) return;

    const lesson = LESSONS[idx];

    lessonContent.innerHTML = `
      ${lesson.content}
      <div class="lesson-nav-btns">
        ${idx > 0 ? `<button class="btn btn-ghost" id="prevLessonBtn" type="button">← Previous</button>` : '<div></div>'}
        ${idx < LESSONS.length - 1
          ? `<button class="btn btn-primary" id="nextLessonBtn" type="button">Next →</button>`
          : `<a class="btn btn-primary" href="quiz.html">Take the Quiz →</a>`
        }
      </div>
    `;

    // Wire nav buttons
    const prevBtn = document.getElementById('prevLessonBtn');
    const nextBtn = document.getElementById('nextLessonBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => showLesson(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showLesson(idx + 1));

    // Update sidebar active state
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(function (link, i) {
      link.classList.toggle('active', i === idx);
    });

    // Update document title
    document.title = `${lesson.title} | CyberAware`;
  }

  // Show first lesson by default
  showLesson(0);

  /* ═══════════════════════════════════════════════════
     XSS LAB — Vulnerable vs Safe Demo
  ═══════════════════════════════════════════════════ */
  const vulnInput  = document.getElementById('vulnInput');
  const vulnSubmit = document.getElementById('vulnSubmit');
  const vulnOutput = document.getElementById('vulnOutput');
  const safeInput  = document.getElementById('safeInput');
  const safeSubmit = document.getElementById('safeSubmit');
  const safeOutput = document.getElementById('safeOutput');

  /**
   * VULNERABLE render — uses innerHTML directly.
   * This is INTENTIONALLY insecure to demonstrate XSS.
   * Try entering: <b>bold</b> or <i>italic</i> to see HTML rendered.
   * In a real attack: <script>alert('XSS')</script> or <img src=x onerror=alert(1)>
   */
  if (vulnSubmit && vulnInput && vulnOutput) {
    vulnSubmit.addEventListener('click', function () {
      const userInput = vulnInput.value;
      // ❌ Unsafe: renders HTML — XSS vulnerability demonstrated
      vulnOutput.innerHTML = `Hello, ${userInput}!`;
    });
  }

  /**
   * SAFE render — escapes HTML entities before inserting.
   * Try the same inputs — they render as literal text, not HTML.
   */
  if (safeSubmit && safeInput && safeOutput) {
    safeSubmit.addEventListener('click', function () {
      const userInput = safeInput.value;
      // ✅ Safe: escape all HTML entities
      safeOutput.textContent = `Hello, ${userInput}!`;
    });
  }

})();
