/**
 * security-lab.js
 * CyberAware Security Lab Logic
 */

'use strict';

(function () {

  /* ─── TAB SWITCHING ────────────────────────────────────────────────────── */
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoPanels = document.querySelectorAll('.demo-panel');

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.demo;
      
      // Update tabs
      demoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update panels
      demoPanels.forEach(p => p.classList.remove('active'));
      document.getElementById(`demo-${target}`).classList.add('active');
    });
  });

  /* ─── XSS DEMO ─────────────────────────────────────────────────────────── */
  const xssInput = document.getElementById('xss-input');
  const btnXss = document.getElementById('btn-xss-test');
  const xssVulnerable = document.getElementById('xss-vulnerable');
  const xssSecure = document.getElementById('xss-secure');

  if (btnXss) {
    btnXss.addEventListener('click', () => {
      const value = xssInput.value || '---';
      
      // VULNERABLE: Using innerHTML allows script execution (if not blocked by CSP)
      // Note: CSP will actually block <script> injection in our app, 
      // but innerHTML is still dangerous for other reasons (e.g. <img src=x onerror=...>)
      xssVulnerable.innerHTML = value;
      
      // SECURE: Using textContent renders everything as literal text
      xssSecure.textContent = value;
    });
  }

  /* ─── PASSWORD DEMO ────────────────────────────────────────────────────── */
  const pwInput    = document.getElementById('pw-demo-input');
  const strengthViz = document.getElementById('pw-strength-viz');
  const hashBc     = document.getElementById('hash-bcrypt');
  const hashMd5    = document.getElementById('hash-md5'); // FIX: was never updated

  // Guard: only attach listener if ALL required elements exist
  if (pwInput && strengthViz && hashBc && hashMd5) {
    pwInput.addEventListener('input', function() {
      const val = this.value;
      const length = val.length;

      // Update strength bar visualization
      let color = '#333';
      let width = '5%';

      if (length > 0) {
        if (length < 6)       { color = '#ff0055'; width = '25%'; }
        else if (length < 10) { color = '#ffaa00'; width = '50%'; }
        else if (length < 14) { color = '#00f2ff'; width = '75%'; }
        else                  { color = '#00ffaa'; width = '100%'; }
      }

      strengthViz.style.backgroundColor = color;
      strengthViz.style.width = width;
      strengthViz.style.boxShadow = `0 0 10px ${color}`;

      if (length > 0) {
        // FIX: hash-md5 was always static — now shows a fake hex string that
        // changes with input to illustrate how MD5 produces a fixed-length digest.
        // Real MD5 cannot run in the browser without a library, so we simulate it
        // using btoa to produce a plausible-looking 32-char hex-like display.
        const fakeMd5 = Array.from(btoa(val + 'md5salt'))
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
          .substring(0, 32);
        hashMd5.textContent = fakeMd5 + ' ⚠ (Broken — Rainbow Table Vulnerable)';

        // Mock bcrypt hash display (real hashing happens server-side with bcryptjs)
        hashBc.textContent = `$2b$12$${btoa(val).substring(0, 22)}... [Salted & Slow — Safe ✓]`;
      } else {
        hashMd5.textContent = 'e10adc3949ba59abbe56e057f20f883e'; // default placeholder
        hashBc.textContent  = '$2b$12$Z8mY... (Salted & Slow)';
      }
    });
  }

})();
