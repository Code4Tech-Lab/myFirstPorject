/**
 * nav.js — Responsive navigation, scroll effects, active link highlighting
 * CyberAware Cybersecurity Education Platform
 *
 * Security note: No inline JS used anywhere. All event listeners attached here.
 * No external libraries loaded — vanilla JS only.
 */

'use strict';

(function () {
  /* ─── DOM REFERENCES ─── */
  const header = document.querySelector('.site-header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (!header || !navToggle || !navMenu) return; // Guard: elements must exist

  /* ─── HAMBURGER TOGGLE ─── */
  navToggle.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
    //document.body.classList.toggle('menu-open', isOpen);
  });

  /* ─── CLOSE MENU ON LINK CLICK (mobile) ─── */
  navMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // document.body.classList.remove('menu-open');
    }
  });

  /* ─── CLOSE MENU ON ESC KEY ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus(); // Return focus to toggle button
    }
  });

  /* ─── CLOSE MENU ON OUTSIDE CLICK ─── */
  document.addEventListener('click', function (e) {
    if (
      navMenu.classList.contains('is-open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ─── SCROLL — Add "scrolled" class to header for shadow ─── */
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  // Use passive listener for performance (does not call preventDefault)
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on page load

  /* ─── RESIZE — Close menu if resized to desktop ─── */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ─── SESSION MANAGEMENT ─── */
  const navList = document.querySelector('.nav-menu');
  function updateNavForSession() {
    const userJson = sessionStorage.getItem('cyberaware_user');
    if (!userJson || !navList) return;

    try {
      const user = JSON.parse(userJson);
      // Find the Login/Signup link (usually the last one before any divider or at the end)
      const authLinks = Array.from(navList.querySelectorAll('a[href*="login.html"]'));

      authLinks.forEach(link => {
        const li = link.parentElement;
        if (li) {
          li.innerHTML = `
            <div class="user-menu">
              <span class="user-name">👋 ${user.fullName.split(' ')[0]}</span>
              <button id="logoutBtn" class="btn btn-ghost btn-sm" style="margin-left: 1rem; padding: 0.4rem 0.8rem;">Logout</button>
            </div>
          `;
        }
      });

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('cyberaware_user');
          window.location.reload();
        });
      }
    } catch (e) {
      console.error('Session parse error:', e);
    }
  }

  // Initial update
  updateNavForSession();

})();
