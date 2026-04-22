/**
 * home.js — Homepage animations: floating particles, counter animation
 * CyberAware Cybersecurity Education Platform
 *
 * Features:
 * - Dynamic floating particle system for the hero background
 * - Intersection Observer for scroll-triggered animations
 * - Respects prefers-reduced-motion for accessibility
 */

'use strict';

(function () {
  /* ─── REDUCED MOTION PREFERENCE ─── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── PARTICLE SYSTEM ─── */
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer && !prefersReducedMotion) {
    const PARTICLE_COUNT = 30;

    /**
     * Creates a single floating particle element and appends it to the container.
     * Each particle has randomised position, size, duration, and delay.
     */
    function createParticle() {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.setAttribute('aria-hidden', 'true');

      // Randomise properties
      const x        = Math.random() * 100;  // % from left
      const size     = Math.random() * 3 + 1; // 1–4px
      const duration = Math.random() * 15 + 8; // 8–23s
      const delay    = Math.random() * 10;    // 0–10s

      particle.style.cssText = `
        left: ${x}%;
        bottom: -10px;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.5 + 0.2};
      `;

      return particle;
    }

    // Create and append all particles
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      fragment.appendChild(createParticle());
    }
    particleContainer.appendChild(fragment);
  }

  /* ─── SCROLL-BASED FADE-IN ANIMATIONS ─── */
  if (!prefersReducedMotion) {
    // Add initial styles for animation
    const style = document.createElement('style');
    style.textContent = `
      .anim-fade-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .anim-fade-up.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // Elements to animate
    const animTargets = document.querySelectorAll(
      '.arch-step, .card, .sftp-callout, .security-card'
    );

    animTargets.forEach(function (el) {
      el.classList.add('anim-fade-up');
    });

    // Intersection Observer: triggers animation when element is visible
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      { threshold: 0.15 }
    );

    animTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

})();
