# CyberAware — Final Technical Report

**Document Version:** 1.0  
**Date:** April 2026  
**Project:** CyberAware Cybersecurity Education Platform

---

## 1. Executive Summary

CyberAware is a complete static multi-page web application built with standards-compliant HTML5, CSS3 (vanilla), and vanilla JavaScript. It delivers cybersecurity education through 10 structured lessons, a 10-question graded quiz, an interactive security lab, curated resources, and deployment guidance. The project demonstrates industry best practices across web architecture, responsive design, WCAG 2.1 AA accessibility, client-side security, and form validation.

---

## 2. Architecture Explanation

### 2.1 Client–Server Model

```
User Browser (Client)
     │
     │  1. Types "cyberaware.example.com"
     ▼
DNS Resolver
     │
     │  2. Resolves domain → IP address (e.g. 185.199.108.153 for GitHub Pages)
     ▼
Web Server / CDN (GitHub Pages / Netlify / Nginx)
     │
     │  3. Returns HTML, CSS, JS, images over HTTPS
     ▼
Browser Renders Page
```

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Structure | HTML5 (Semantic) | W3C standards, screen reader support |
| Styling | Vanilla CSS3 | No framework overhead, full control |
| CSS Architecture | Custom Properties + BEM-like naming | Maintainable design system |
| Behaviour | Vanilla JavaScript (ES6+) | No dependencies, fastest load |
| Fonts | Google Fonts (Inter + JetBrains Mono) | Modern, readable typefaces |
| Hosting | GitHub Pages / Netlify / Nginx | Free HTTPS, global CDN |

### 2.3 Folder Structure

```
/cyberaware
├── index.html              ← Home page
├── pages/
│   ├── learn.html          ← Lessons + Security Lab
│   ├── quiz.html           ← Interactive quiz
│   ├── resources.html      ← Resources + Deployment + Accessibility
│   ├── contact.html        ← Contact form
│   └── login.html          ← Login / Signup
├── css/
│   ├── base.css            ← Tokens, reset, typography, utilities, buttons
│   ├── layout.css          ← Header, navbar, footer, page grids
│   ├── components.css      ← Cards, forms, quiz, tabs, accordion, badges
│   ├── home.css            ← Homepage-specific: hero, arch flow, CTA
│   └── pages.css           ← Inner page styles: learn, contact, auth
├── js/
│   ├── nav.js              ← Hamburger, scroll effects, keyboard nav
│   ├── home.js             ← Particle system, scroll animations
│   ├── quiz.js             ← Quiz engine, localStorage, results
│   ├── contact.js          ← Form validation, CSRF simulation
│   ├── login.js            ← Auth tabs, password strength, validation
│   ├── learn.js            ← Lesson data, sidebar, XSS lab
│   └── tabs.js             ← ARIA tab + accordion components
├── images/                 ← (Empty — no placeholder images used)
└── docs/
    ├── project_charter.md  ← Charter, roles, progress log
    └── technical_report.md ← This document
```

---

## 3. Security Analysis

### 3.1 Threats Covered

| OWASP Category | Status | Implementation |
|----------------|--------|----------------|
| A01 Broken Access Control | ✅ Covered | Demo-only auth; explanation of session management |
| A02 Cryptographic Failures | ✅ Covered | HTTPS explanation, bcrypt guidance, no plain-text passwords |
| A03 Injection (XSS, SQLi) | ✅ Demonstrated | Live XSS lab; SQL injection lesson with code examples |
| A04 Insecure Design | ✅ Covered | CSRF token simulation; secure cookie attributes explained |
| A05 Security Misconfiguration | ✅ Covered | HTTP security headers explained (CSP, HSTS, X-Frame-Options) |
| A07 Auth & Session Management | ✅ Covered | Password hashing, session fixation, httpOnly/Secure cookies |
| A10 SSRF | ℹ️ Mentioned | Out of scope for static site; referenced in resources |

### 3.2 Vulnerability Simulation: XSS

**Location:** `pages/learn.html` → Security Lab  
**Vulnerability demonstrated:** DOM-based XSS via `innerHTML`

```javascript
// ❌ VULNERABLE — learn.js (deliberate for educational purposes)
vulnOutput.innerHTML = `Hello, ${userInput}!`;
// Try: <img src=x onerror=alert('XSS')> — renders as executable HTML
```

**Fix demonstrated:**

```javascript
// ✅ SECURE — textContent escapes HTML, no execution possible
safeOutput.textContent = `Hello, ${userInput}!`;
// Or use the escapeHTML() function from quiz.js for innerHTML contexts
```

**Key Lesson:** Never trust user input. Use `textContent` or escape HTML entities before `innerHTML`.

### 3.3 CSRF Protection (Simulated)

A CSRF token is generated using `window.crypto.getRandomValues()` on every form load and regenerated after each submission. In production this token would be:
1. Generated server-side, stored in the user's session
2. Embedded as a hidden form field
3. Validated server-side on every state-changing POST request

```javascript
function generateCSRFToken() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array); // Cryptographically secure random
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 3.4 Input Validation & Sanitization

| Field | Client Validation | Regex Used |
|-------|------------------|-----------|
| Email | ✅ | `/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/` |
| Phone | ✅ Optional | `/^(\+?\d{1,4}[\s\-]?)?(\(?\d{1,4}\)?[\s\-]?)?[\d\s\-]{6,14}\d$/` |
| Password | ✅ Strength score | 4 criteria: length, uppercase, number, symbol |
| Name fields | ✅ | Length 1–50 |
| Message | ✅ | Length 20–2000 |

> **Security Warning:** Client-side validation improves UX but provides NO security. A server must always re-validate and sanitize all input. An attacker can bypass client JS using `curl` or Burp Suite.

### 3.5 Session Handling (Production Guidance)

For production deployment, sessions must be:
- Managed server-side (not just localStorage)
- Protected with `HttpOnly`, `Secure`, `SameSite=Strict` cookie attributes
- Invalidated on logout (server must delete session record)
- Protected against session fixation (regenerate ID on login)
- Rate-limited (prevent brute force — max 5 attempts / 15 minutes)

### 3.6 Phishing Awareness

The Learn page covers phishing red flags:
- Mismatched sender domains
- Urgent language patterns
- Suspicious links / attachments
- How password managers defend against fake sites (won't autofill wrong domain)

---

## 4. Accessibility Checklist (WCAG 2.1 AA)

| Criterion | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| 1.1.1 Non-text Content | A | ✅ | All images have alt text or aria-hidden="true" |
| 1.3.1 Info and Relationships | A | ✅ | Semantic HTML5 landmark elements |
| 1.3.5 Identify Input Purpose | AA | ✅ | autocomplete attributes on all form inputs |
| 1.4.3 Contrast (Min) | AA | ✅ | All text ≥ 4.5:1 on dark background |
| 1.4.10 Reflow | AA | ✅ | Mobile-first, no horizontal scroll at 375px |
| 2.1.1 Keyboard | A | ✅ | All interactive elements keyboard accessible |
| 2.1.2 No Keyboard Trap | A | ✅ | Esc closes mobile menu, returns focus |
| 2.4.1 Bypass Blocks | A | ✅ | Skip link at top of every page |
| 2.4.3 Focus Order | A | ✅ | Logical DOM order |
| 2.4.7 Focus Visible | AA | ✅ | 2px outline on all interactive elements |
| 3.1.1 Language | A | ✅ | `lang="en"` on all html elements |
| 3.2.1 On Focus | A | ✅ | No context change on focus |
| 3.3.1 Error Identification | A | ✅ | Error messages with role="alert" |
| 3.3.2 Labels or Instructions | A | ✅ | All inputs have <label> or aria-label |
| 4.1.2 Name, Role, Value | A | ✅ | ARIA on nav toggle, quiz, tabs, accordions |
| 4.1.3 Status Messages | AA | ✅ | aria-live on quiz feedback, form success/error |

---

## 5. Validation Summary

### 5.1 HTML Validation (W3C)

All pages use:
- `<!DOCTYPE html>` declaration
- `lang="en"` on `<html>`
- Proper `<meta charset="UTF-8">` and viewport tags
- Single `<h1>` per page
- Semantic landmark elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- All images with `alt` attributes
- All form inputs with associated `<label>` elements
- No deprecated elements or attributes

**Validate at:** https://validator.w3.org/

### 5.2 CSS Validation

- External stylesheets only — no inline styles except dynamic values set by JavaScript
- No `!important` overuse
- CSS Custom Properties used for all design tokens

**Validate at:** https://jigsaw.w3.org/css-validator/

### 5.3 JavaScript Quality

- `'use strict'` in all JS files
- No `eval()` usage
- No `innerHTML` with user input (except intentional XSS demo, clearly labelled)
- All event listeners attached programmatically (no `onclick=""` attributes)
- IIFE pattern used to avoid global scope pollution

---

## 6. QA Test Results

See [Resources page → Testing tab] for the full test case table (15 test cases, all passing).

**Summary:**
- ✅ All pages load correctly
- ✅ All nav links navigate to correct pages  
- ✅ Contact form validates all fields
- ✅ Quiz scores and persists to localStorage
- ✅ Hamburger menu works on mobile
- ✅ Keyboard navigation works throughout
- ✅ XSS lab demonstrates vulnerability and fix correctly

---

## 7. Deployment Guide Summary

| Platform | Time to Deploy | Cost | HTTPS |
|----------|---------------|------|-------|
| GitHub Pages | ~5 minutes | Free | ✅ Auto |
| Netlify | ~3 minutes | Free | ✅ Auto |
| VM + Nginx + Certbot | ~30 minutes | VPS cost | ✅ Free (Let's Encrypt) |

See the Resources page for step-by-step instructions for all three options, including the SFTP guide for FileZilla.

---

## 8. Lessons Learned & Recommendations

1. **HTTPS everywhere** — No exceptions. Use Let's Encrypt for free certificates.
2. **Input validation is dual-layer** — Client JS for UX, server-side for security.
3. **textContent vs innerHTML** — Default to textContent; only use innerHTML with fully trusted, escaped content.
4. **Semantic HTML is free accessibility** — Using the right elements reduces ARIA complexity.
5. **CSRF tokens should be single-use** — Regenerate after every successful submission.
6. **Password hashing matters** — bcrypt with ≥10 rounds is the minimum. Argon2id is preferred.
7. **Accessibility benefits everyone** — Good focus indicators, clear labels, and keyboard nav help all users, not just those with disabilities.
