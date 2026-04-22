/**
 * contact.js — Contact form validation with regex, CSRF token simulation
 * CyberAware Cybersecurity Education Platform
 *
 * Security Features:
 * - CSRF token generated client-side (simulation — production needs server-side token)
 * - Input validation using regex for email and phone
 * - No inline JS — all listeners attached here
 * - HTML escaping prevents XSS in any dynamic output
 * - Required fields enforced with accessible error messages
 *
 * Sanitization note (for cybersecurity students):
 * Client-side validation improves UX but CANNOT be trusted for security.
 * Server-side must ALWAYS re-validate and sanitize. An attacker can bypass
 * client JS entirely using curl or Burp Suite.
 */

'use strict';

(function () {

  /* ─── DOM REFERENCES ─── */
  const form           = document.getElementById('contactForm');
  const csrfInput      = document.getElementById('csrfToken');
  const successAlert   = document.getElementById('formSuccess');
  const errorAlert     = document.getElementById('formError');
  const charCountEl    = document.getElementById('charCount');
  const messageInput   = document.getElementById('message');

  if (!form) return; // Guard

  /* ─── GENERATE CSRF TOKEN ─── */
  /**
   * Generates a cryptographically random 32-char hex token.
   * Sent as the X-CSRF-Token header on every API request.
   * The server validates that this header is present and correctly formatted.
   * Custom request headers cannot be added by cross-origin form submissions —
   * this is the CSRF defense.
   */
  function generateCSRFToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Store in variable (not just in the DOM input) so it is accessible to fetch
  let csrfToken = generateCSRFToken();
  if (csrfInput) {
    csrfInput.value = csrfToken; // keep hidden input in sync for display purposes
  }

  /* ─── CHARACTER COUNTER ─── */
  if (messageInput && charCountEl) {
    messageInput.addEventListener('input', function () {
      charCountEl.textContent = String(this.value.length);
    });
  }

  /* ─── REGEX VALIDATORS ─── */
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  // Matches international phone formats: +1 (555) 000-0000, 07XXXXXXXXX, +44 7700 900000, etc.
  const PHONE_REGEX = /^(\+?\d{1,4}[\s\-]?)?(\(?\d{1,4}\)?[\s\-]?)?[\d\s\-]{6,14}\d$/;

  /* ─── FIELD VALIDATOR ─── */
  /**
   * Validates a single field and toggles error/valid UI states.
   * @param {HTMLElement} field - The input/textarea/select element
   * @param {Function} validatorFn - Returns true if value is valid
   * @returns {boolean} Whether field is valid
   */
  function validateField(field, validatorFn) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const isValid = validatorFn(field.value.trim());

    if (isValid) {
      field.classList.remove('is-error');
      field.classList.add('is-valid');
      if (errorEl) errorEl.classList.remove('visible');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-error');
      if (errorEl) errorEl.classList.add('visible');
    }

    return isValid;
  }

  /* ─── FIELD DEFINITIONS ─── */
  const fields = [
    {
      el: document.getElementById('firstName'),
      validate: v => v.length >= 1 && v.length <= 50
    },
    {
      el: document.getElementById('lastName'),
      validate: v => v.length >= 1 && v.length <= 50
    },
    {
      el: document.getElementById('email'),
      validate: v => EMAIL_REGEX.test(v)
    },
    {
      el: document.getElementById('phone'),
      /**
       * Phone is optional — valid if empty OR matches format
       */
      validate: v => v === '' || PHONE_REGEX.test(v),
      optional: true
    },
    {
      el: document.getElementById('subject'),
      validate: v => v !== ''
    },
    {
      el: document.getElementById('message'),
      validate: v => v.length >= 20 && v.length <= 2000
    }
  ];

  const privacyField = document.getElementById('privacy');

  /* ─── REAL-TIME VALIDATION (on blur) ─── */
  fields.forEach(function (field) {
    if (!field.el) return;
    field.el.addEventListener('blur', function () {
      validateField(field.el, field.validate);
    });
    // Clear error on input
    field.el.addEventListener('input', function () {
      if (field.el.classList.contains('is-error')) {
        field.el.classList.remove('is-error');
        const errorEl = document.getElementById(`${field.el.id}-error`);
        if (errorEl) errorEl.classList.remove('visible');
      }
    });
  });

  /* ─── FORM SUBMIT HANDLER ─── */
  form.addEventListener('submit', function (event) {
    // Always prevent default — we handle submission
    event.preventDefault();

    hideAlerts();

    // Validate all fields
    let formIsValid = true;
    let firstInvalidEl = null;

    fields.forEach(function (field) {
      if (!field.el) return;
      const valid = validateField(field.el, field.validate);
      if (!valid) {
        formIsValid = false;
        if (!firstInvalidEl) firstInvalidEl = field.el;
      }
    });

    // Validate privacy checkbox
    if (privacyField && !privacyField.checked) {
      formIsValid = false;
      const privacyError = document.getElementById('privacy-error');
      if (privacyError) privacyError.classList.add('visible');
      if (!firstInvalidEl) firstInvalidEl = privacyField;
    } else if (privacyField) {
      const privacyError = document.getElementById('privacy-error');
      if (privacyError) privacyError.classList.remove('visible');
    }

    if (!formIsValid) {
      // Show global error alert
      if (errorAlert) errorAlert.style.display = 'flex';
      // Focus first invalid field for accessibility
      if (firstInvalidEl) firstInvalidEl.focus();
      return;
    }

    /**
     * POST to backend API
     */
    const submitBtn = document.getElementById('contactSubmit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    const payload = {
      firstName: document.getElementById('firstName').value,
      lastName:  document.getElementById('lastName').value,
      email:     document.getElementById('email').value,
      phone:     document.getElementById('phone').value,
      subject:   document.getElementById('subject').value,
      message:   document.getElementById('message').value
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,  // FIX: was missing — server now requires this header
        'Accept':       'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Rotate token after successful submission
        csrfToken = generateCSRFToken();
        if (csrfInput) csrfInput.value = csrfToken;
        if (successAlert) {
          const textSpan = successAlert.querySelector('span:last-child') || successAlert;
          textSpan.textContent = data.message;
          successAlert.style.display = 'flex';
        }
        form.reset();
        if (charCountEl) charCountEl.textContent = '0';
        fields.forEach(f => { if (f.el) f.el.classList.remove('is-valid', 'is-error'); });
        if (successAlert) successAlert.focus();
      } else {
        throw new Error(data.error || 'Failed to send message.');
      }
    })
    .catch(err => {
      if (errorAlert) {
        const textSpan = errorAlert.querySelector('span:last-child') || errorAlert;
        textSpan.textContent = err.message;
        errorAlert.style.display = 'flex';
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message →';
      }
    });
  });

  /* ─── HELPERS ─── */
  function hideAlerts() {
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert)   errorAlert.style.display   = 'none';
  }

})();
