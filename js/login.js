/**
 * login.js — Login/Signup forms with real backend API integration
 * CyberAware Cybersecurity Education Platform
 *
 * Security Features:
 * - Passwords sent over HTTPS (TLS encrypts request body in transit)
 * - CSRF token generated with window.crypto — sent as X-CSRF-Token header
 * - Email validated client-side (regex) AND server-side — both layers needed
 * - Password strength meter before submission
 * - Passwords never logged, stored locally, or echoed back
 * - All API responses parsed safely — no innerHTML with response data
 *
 * API Endpoints used:
 *   POST /api/register  — { fullName, email, password }
 *   POST /api/login     — { email, password }
 *
 * Note on client-side validation:
 *   Client validation improves UX and reduces unnecessary server calls.
 *   It CANNOT be trusted for security — the server re-validates everything.
 *   An attacker can bypass JS by sending raw HTTP requests with curl/Burp.
 */

'use strict';

(function () {

  /* ─── BASE API URL ─────────────────────────────────────────────────────── */
  // When served by Express on the same origin, /api/* works without a full URL.
  // If you host frontend and backend separately, change this:
  //   const API_BASE = 'https://your-backend.com';
  const API_BASE = '';

  /* ─── AUTH TAB SWITCHING ───────────────────────────────────────────────── */
  const loginTab    = document.getElementById('loginTab');
  const signupTab   = document.getElementById('signupTab');
  const loginPanel  = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin  = document.getElementById('switchToLogin');

  /**
   * showPanel('login' | 'signup')
   * Switches the visible auth panel and updates ARIA attributes.
   */
  function showPanel(panel) {
    const showLogin = panel === 'login';
    loginTab.classList.toggle('active', showLogin);
    signupTab.classList.toggle('active', !showLogin);
    loginTab.setAttribute('aria-selected', String(showLogin));
    signupTab.setAttribute('aria-selected', String(!showLogin));
    loginPanel.classList.toggle('active', showLogin);
    signupPanel.classList.toggle('active', !showLogin);
    // Clear all alerts on panel switch
    hideAllAlerts();
  }

  if (loginTab)       loginTab.addEventListener('click',       () => showPanel('login'));
  if (signupTab)      signupTab.addEventListener('click',      () => showPanel('signup'));
  if (switchToSignup) switchToSignup.addEventListener('click', () => showPanel('signup'));
  if (switchToLogin)  switchToLogin.addEventListener('click',  () => showPanel('login'));

  /* ─── CSRF TOKEN ───────────────────────────────────────────────────────── */
  /**
   * generateCSRFToken()
   * Creates a cryptographically random hex token.
   * Sent as the X-CSRF-Token header on every API request.
   * Server should validate this token against the user's session.
   * (In this demo the server doesn't validate it — but the infrastructure is in place.)
   */
  function generateCSRFToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // One token per page load — regenerated after each successful request
  let csrfToken = generateCSRFToken();

  /* ─── REGEX ────────────────────────────────────────────────────────────── */
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  /* ─── FIELD VALIDATOR ──────────────────────────────────────────────────── */
  /**
   * validateField(fieldId, isValid)
   * Toggles is-error / is-valid CSS classes and shows/hides the error span.
   * @returns {boolean}
   */
  function validateField(fieldId, isValid) {
    const field   = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (!field) return true;
    field.classList.toggle('is-error',  !isValid);
    field.classList.toggle('is-valid',   isValid);
    if (errorEl) errorEl.classList.toggle('visible', !isValid);
    return isValid;
  }

  /* ─── ALERT HELPERS ────────────────────────────────────────────────────── */
  /**
   * showAlert(alertId, message)
   * Displays a pre-existing alert element and sets its text safely.
   * Uses textContent (NOT innerHTML) — prevents XSS from API error messages.
   */
  function showAlert(alertId, message) {
    const el = document.getElementById(alertId);
    if (!el) return;
    // Find the text node (span after the icon span) and set content safely
    const textSpan = el.querySelector('span:last-child');
    if (textSpan) textSpan.textContent = message; // textContent — never innerHTML
    el.style.display = 'flex';
    el.focus();
  }

  function hideAlert(alertId) {
    const el = document.getElementById(alertId);
    if (el) el.style.display = 'none';
  }

  function hideAllAlerts() {
    ['loginSuccess', 'loginError', 'signupSuccess', 'signupError'].forEach(hideAlert);
  }

  /* ─── LOADING STATE ────────────────────────────────────────────────────── */
  /**
   * setButtonLoading(btnId, loading, defaultText)
   * Disables/enables button and shows a loading indicator.
   */
  function setButtonLoading(btnId, loading, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? 'Please wait…' : defaultText;
  }

  /* ─── CORE FETCH HELPER ────────────────────────────────────────────────── */
  /**
   * apiPost(endpoint, body)
   * Sends a JSON POST request to the backend.
   * Attaches CSRF token and Content-Type headers.
   *
   * Returns the parsed JSON response object.
   * Throws an Error with a user-friendly message on network or server failure.
   *
   * @param {string} endpoint  — e.g. '/api/register'
   * @param {Object} body      — plain JS object (will be JSON.stringify'd)
   * @returns {Promise<Object>} — parsed response JSON
   */
  async function apiPost(endpoint, body) {
    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'X-CSRF-Token':  csrfToken,         // Anti-CSRF header
          'Accept':        'application/json',
        },
        // JSON.stringify serialises the object — never interpolate user data into strings
        body: JSON.stringify(body),
      });
    } catch (networkError) {
      // fetch() itself threw — server unreachable, offline, DNS failure etc.
      throw new Error('Cannot reach the server. Is it running? (npm run start)');
    }

    // Parse the JSON body regardless of status code
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Server returned an unexpected response. Please try again.');
    }

    // Rotate CSRF token after every request (one-time use tokens)
    csrfToken = generateCSRFToken();

    // If the server returned an error status, throw with the server's message
    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status})`);
    }

    return data;
  }

  /* ─── PASSWORD VISIBILITY TOGGLE ──────────────────────────────────────── */
  function setupPasswordToggle(toggleBtnId, inputId) {
    const btn   = document.getElementById(toggleBtnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', function () {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      btn.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
      btn.textContent = isVisible ? '👁' : '🙈';
    });
  }
  setupPasswordToggle('toggleLoginPw',  'loginPassword');
  setupPasswordToggle('toggleSignupPw', 'signupPassword');

  /* ─── PASSWORD STRENGTH METER ──────────────────────────────────────────── */
  const signupPasswordInput = document.getElementById('signupPassword');
  const strengthContainer   = document.getElementById('passwordStrength');
  const strengthLabel       = document.getElementById('strengthLabel');
  const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

  /**
   * getPasswordStrength(password) → 0–4
   * Score increments for: length≥8, uppercase, digit, special char.
   */
  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8)                                          score++;
    if (/[A-Z]/.test(password))                                        score++;
    if (/[0-9]/.test(password))                                        score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))      score++;
    return score;
  }

  if (signupPasswordInput && strengthContainer && strengthLabel) {
    signupPasswordInput.addEventListener('input', function () {
      const score = this.value.length === 0 ? 0 : getPasswordStrength(this.value);
      strengthContainer.className = `password-strength strength-${score}`;
      strengthContainer.setAttribute('aria-valuenow', String(score));
      strengthLabel.textContent = this.value.length === 0 ? 'Enter a password' : STRENGTH_LABELS[score];
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     LOGIN FORM — POST /api/login
  ═══════════════════════════════════════════════════════════════════════════ */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideAllAlerts();

      // Read input values
      const emailVal    = (document.getElementById('loginEmail')?.value    || '').trim();
      const passwordVal = (document.getElementById('loginPassword')?.value || '');

      // Client-side validation (UX layer — server also validates)
      let valid = true;
      if (!validateField('loginEmail',    EMAIL_REGEX.test(emailVal))) valid = false;
      if (!validateField('loginPassword', passwordVal.length >= 1))    valid = false;
      if (!valid) return;

      setButtonLoading('loginSubmit', true, 'Log In →');

      try {
        // ── API CALL ──────────────────────────────────────────────────────
        // Sends: { email, password } as JSON
        // Server: validates, compares bcrypt hash, returns user profile
        //
        // PASSWORD SECURITY NOTE:
        // The password is sent inside the HTTPS-encrypted request body.
        // TLS encrypts the entire HTTP message — the password is never
        // visible to anyone intercepting network traffic.
        // The server stores only the bcrypt hash — never the raw password.
        const data = await apiPost('/api/login', { email: emailVal, password: passwordVal });

        // ── SUCCESS ───────────────────────────────────────────────────────
        // Store user info in sessionStorage (cleared when tab closes).
        // Do NOT store in localStorage — persists across sessions (less secure).
        // NOTE: In production, the server issues an httpOnly session cookie instead.
        sessionStorage.setItem('cyberaware_user', JSON.stringify({
          id:       data.user.id,
          fullName: data.user.fullName,
          email:    data.user.email,
        }));

        showAlert('loginSuccess', `Welcome back, ${data.user.fullName}! Login successful.`);
        loginForm.reset();

        // Redirect to home page after 1.5s
        setTimeout(() => { window.location.href = '../index.html'; }, 1500);

      } catch (err) {
        // Show server error message (sanitised — comes from our own API)
        showAlert('loginError', err.message);
      } finally {
        setButtonLoading('loginSubmit', false, 'Log In →');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SIGNUP FORM — POST /api/register
  ═══════════════════════════════════════════════════════════════════════════ */
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideAllAlerts();

      // Read and trim values
      const firstNameVal  = (document.getElementById('signupFirstName')?.value  || '').trim();
      const lastNameVal   = (document.getElementById('signupLastName')?.value   || '').trim();
      const emailVal      = (document.getElementById('signupEmail')?.value      || '').trim();
      const passwordVal   = (document.getElementById('signupPassword')?.value   || '');
      const confirmVal    = (document.getElementById('confirmPassword')?.value  || '');
      const privacyCheck  =  document.getElementById('signupPrivacy')?.checked;

      const fullName = `${firstNameVal} ${lastNameVal}`.trim();

      // Client-side validation
      let valid = true;
      if (!validateField('signupFirstName',  firstNameVal.length >= 1))                                  valid = false;
      if (!validateField('signupLastName',   lastNameVal.length >= 1))                                    valid = false;
      if (!validateField('signupEmail',      EMAIL_REGEX.test(emailVal)))                                 valid = false;
      if (!validateField('signupPassword',   getPasswordStrength(passwordVal) >= 3))                      valid = false;
      if (!validateField('confirmPassword',  confirmVal === passwordVal && confirmVal.length > 0))         valid = false;
      if (!validateField('signupPrivacy',    !!privacyCheck))                                             valid = false;
      if (!valid) {
        showAlert('signupError', 'Please fix the errors highlighted above.');
        return;
      }

      setButtonLoading('signupSubmit', true, 'Create Account →');

      try {
        // ── API CALL ──────────────────────────────────────────────────────
        // Sends: { fullName, email, password } as JSON
        // The confirmPassword field is NOT sent — it's a UI-only check.
        // Server: validates → checks uniqueness → bcrypt hashes → inserts row
        const data = await apiPost('/api/register', {
          fullName,
          email:    emailVal,
          password: passwordVal,
          // NOTE: confirmPassword intentionally omitted — server doesn't need it
        });

        // ── SUCCESS ───────────────────────────────────────────────────────
        showAlert('signupSuccess',
          `Account created! Welcome, ${data.user.fullName}. You can now log in.`
        );
        signupForm.reset();
        if (strengthContainer) strengthContainer.className = 'password-strength strength-0';
        if (strengthLabel)     strengthLabel.textContent   = 'Enter a password';

        // Auto-switch to login tab after 2s
        setTimeout(() => showPanel('login'), 2000);

      } catch (err) {
        showAlert('signupError', err.message);
      } finally {
        setButtonLoading('signupSubmit', false, 'Create Account →');
      }
    });
  }

})();
