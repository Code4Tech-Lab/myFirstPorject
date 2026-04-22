/**
 * tabs.js — Generic tab component for Resources and nested deployment tabs
 * CyberAware Cybersecurity Education Platform
 *
 * Works with any tab list following the ARIA tab pattern:
 * role="tablist" > role="tab" with aria-controls pointing to role="tabpanel"
 *
 * Supports keyboard navigation:
 * - Arrow Left / Right — move between tabs
 * - Home / End — jump to first / last tab
 */

'use strict';

(function () {

  /**
   * Initialises a set of tabs within a container.
   * @param {Element} tabList - The element with role="tablist"
   */
  function initTabList(tabList) {
    const tabs   = Array.from(tabList.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    /**
     * Activates a specific tab and its associated panel.
     * @param {Element} tab - The tab button to activate
     */
    function activateTab(tab) {
      // Deactivate all tabs in this group
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');

        // Hide associated panel
        const panelId = t.getAttribute('aria-controls');
        const panel   = panelId ? document.getElementById(panelId) : null;
        if (panel) panel.classList.remove('active');
      });

      // Activate the selected tab
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.removeAttribute('tabindex');
      tab.focus();

      // Show associated panel
      const targetPanelId = tab.getAttribute('aria-controls');
      const targetPanel   = targetPanelId ? document.getElementById(targetPanelId) : null;
      if (targetPanel) {
        targetPanel.classList.add('active');

        // Initialise nested tab lists inside the activated panel (if any)
        const nestedTabLists = targetPanel.querySelectorAll('[role="tablist"]');
        nestedTabLists.forEach(initTabList);
      }
    }

    /* ─── CLICK HANDLER ─── */
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab);
      });
    });

    /* ─── KEYBOARD NAVIGATION (ARIA tab pattern) ─── */
    tabList.addEventListener('keydown', function (e) {
      const currentIdx = tabs.indexOf(document.activeElement);
      if (currentIdx === -1) return;

      let nextIdx = currentIdx;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIdx = (currentIdx + 1) % tabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIdx = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIdx = tabs.length - 1;
          break;
        default:
          return; // Ignore other keys
      }

      activateTab(tabs[nextIdx]);
    });

    /* ─── SET INITIAL tabindex ─── */
    tabs.forEach(function (tab) {
      if (!tab.classList.contains('active')) {
        tab.setAttribute('tabindex', '-1');
      }
    });
  }

  /* ─── INITIALISE ALL TOP-LEVEL TAB LISTS ─── */
  // Find all tablist elements that are not nested inside tabpanels
  // (nested ones get initialised on demand when their parent panel opens)
  const allTabLists = document.querySelectorAll('[role="tablist"]');
  allTabLists.forEach(function (tabList) {
    // Check if this tablist is inside a tabpanel that starts hidden
    const closestPanel = tabList.closest('[role="tabpanel"]');
    if (!closestPanel || closestPanel.classList.contains('active')) {
      initTabList(tabList);
    }
  });

  /* ─── ACCORDION COMPONENT ─── */
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    const btn  = item.querySelector('.accordion-btn');
    const body = item.querySelector('.accordion-body');
    if (!btn || !body) return;

    btn.addEventListener('click', function () {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    // Keyboard support
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

})();
