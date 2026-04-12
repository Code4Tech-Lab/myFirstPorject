# CyberAware — Project Charter

**Document Version:** 1.0  
**Date:** April 2026  
**Status:** Approved

---

## 1. Project Overview

**Project Name:** CyberAware — Cybersecurity Education Platform  
**Project Type:** Static Web Application (HTML5 / CSS3 / Vanilla JavaScript)  
**Target Audience:** Cybersecurity students, web development learners, educators

CyberAware is a multi-page educational website designed to teach cybersecurity fundamentals to students and developers. It covers web security concepts including HTTPS, DNS, phishing, XSS, CSRF, SQL injection, password security, and accessibility — presented through interactive lessons, a graded quiz, and curated resources.

---

## 2. Scope

### In Scope
- 6 HTML pages: Home, Learn, Quiz, Resources, Contact, Login/Signup
- Responsive design (mobile-first, Flexbox/Grid)
- Interactive cybersecurity quiz (10 questions, localStorage score persistence)
- Working contact form with JavaScript validation (email regex, phone regex)
- Login and Signup forms with password strength meter and CSRF simulation
- Security Lab with live XSS demonstration (vulnerable vs secure)
- Deployment guides (GitHub Pages, Netlify, VM + SFTP)
- Full WCAG 2.1 AA accessibility implementation
- Modular CSS architecture (base, layout, components, pages)
- Vanilla JavaScript only — no frameworks or libraries

### Out of Scope
- Server-side processing (backend is simulated)
- Real user authentication (demo only)
- Database integration
- Payment processing
- Third-party analytics

---

## 3. Objectives

| # | Objective | Measurable Criteria |
|---|-----------|---------------------|
| 1 | Teach web security fundamentals | 10 structured lessons covering OWASP Top 10 concepts |
| 2 | Interactive assessment | 10-question quiz with scoring and explanations |
| 3 | Accessibility compliance | WCAG 2.1 AA — skip link, alt text, ARIA, keyboard nav, contrast ≥ 4.5:1 |
| 4 | Form validation | Email + phone regex, required fields, CSRF tokens, accessible errors |
| 5 | Security demonstration | Live XSS lab (vulnerable innerHTML vs safe textContent) |
| 6 | Deployment readiness | GitHub Pages, Netlify, VM+SFTP guides included |
| 7 | Code quality | Semantic HTML5, W3C-valid structure, commented code, no inline JS |
| 8 | Responsive design | Mobile (≤480px), Tablet (≤768px), Desktop (≤1200px) media queries |

---

## 4. Team Roles & Responsibilities

| Role | Responsibilities |
|------|-----------------|
| **Developer** | HTML5 structure, CSS architecture, JavaScript functionality, form validation, quiz engine |
| **Security Lead** | Threat model review, OWASP alignment, XSS/CSRF demo accuracy, security commentary in code |
| **Accessibility Lead** | WCAG 2.1 AA audit, ARIA implementation, screen reader testing, keyboard navigation, contrast verification |
| **Project Manager** | Scope definition, milestone tracking, documentation (charter, progress log, technical report) |

---

## 5. Weekly Progress Log

### Week 1 — Planning & Architecture

- [x] Defined project scope and requirements
- [x] Determined technology stack (HTML5, CSS3, Vanilla JS)
- [x] Designed folder structure
- [x] Created design system (colour palette, typography, spacing tokens)
- [x] Outlined all 6 pages and their content

### Week 2 — HTML Structure

- [x] Built semantic HTML for all 6 pages
- [x] Implemented proper landmark roles (header, nav, main, footer)
- [x] Added ARIA attributes, skip links, and live regions
- [x] Created all form structures with proper labels
- [x] Validated HTML5 structure (W3C compliant)

### Week 3 — CSS & Responsive Design

- [x] Implemented CSS custom properties (design tokens)
- [x] Built CSS reset and base typography
- [x] Created layout system (navbar, footer, page grid)
- [x] Built component library (cards, forms, badges, quiz, tabs)
- [x] Implemented mobile-first responsive design with 3 breakpoints
- [x] Added micro-animations and hover effects

### Week 4 — JavaScript Functionality

- [x] Nav: hamburger menu, scroll effects, keyboard navigation
- [x] Home: particle animations, scroll-triggered fade-ins
- [x] Quiz: 10 questions, scoring, localStorage, results, review table
- [x] Contact form: regex validation, CSRF simulation, accessible errors
- [x] Login/Signup: tab switching, password strength meter, validation
- [x] Learn: lesson data, sidebar navigation, dynamic rendering
- [x] XSS Lab: vulnerable vs safe demo
- [x] Tabs: ARIA-compliant tab keyboard navigation

### Week 5 — Security & Testing

- [x] Security review against OWASP Top 10
- [x] WCAG 2.1 AA accessibility audit
- [x] Cross-browser compatibility check
- [x] Form validation testing (15 test cases)
- [x] Created QA test case table
- [x] Documented known bugs/limitations

### Week 6 — Documentation & Deployment

- [x] Project Charter
- [x] Technical Report
- [x] Deployment guides (GitHub Pages, Netlify, VM + SFTP)
- [x] Accessibility checklist
- [x] QA test cases
- [x] Final review

---

## 6. Deliverables

| Deliverable | Location |
|-------------|----------|
| Complete source code | `/cyberaware/` |
| Project Charter | `/docs/project_charter.md` |
| Technical Report | `/docs/technical_report.md` |
| Deployment Guide | Resources page → Deployment tab |
| Accessibility Checklist | Resources page → Accessibility tab |
| QA Test Cases | Resources page → Testing tab |

---

## 7. Constraints & Assumptions

- No server-side language — all processing is client-side (JavaScript)
- Form submissions are simulated (no data transmitted)
- Authentication is demo-only — no real session management
- Deployment requires a web host or GitHub/Netlify account

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| JavaScript disabled by user | Low | Medium | Add `<noscript>` messages |
| Browser incompatibility | Medium | Low | Progressive enhancement; test in Chrome, Firefox, Safari, Edge |
| Accessibility gaps | Low | High | Regular WAVE/axe audit |
| XSS Lab misuse | Low | High | Clear educational labeling; sandboxed demo only |
