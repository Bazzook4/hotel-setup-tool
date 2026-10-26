/**
 * OnlineHotelier — Tool input UX hooks
 * Adds error-state styling, Calculating… button feedback,
 * and Copied confirmation to tool pages.
 *
 * Design-system rules obeyed:
 * - Error:  var(--secondary) border + var(--secondary-light) fill (never red)
 * - Loading: .is-loading class + spinner via CSS pseudo-element in tool-layout.css
 * - Copied:  .copied class, 1.5 s auto-clear
 *
 * Usage: loaded once, after the page's own script. Works by wrapping the
 * onclick / addEventListener click on .btn-calculate buttons: adds .is-loading
 * on click, removes it after the calc function resolves (sync or async).
 *
 * Validation helper: pages call window.ohValidateField(input, message) to mark
 * a field with .error and show the inline message; clearErrors() before calc.
 */
(function () {
  'use strict';

  /* ---------- Shared helpers exposed on window ---------- */

  /**
   * Mark an input as invalid and show an inline message.
   * @param {HTMLElement} input  - the <input> or <select>
   * @param {string}      msg    - short description, e.g. "Enter a room rate"
   */
  window.ohValidateField = function (input, msg) {
    if (!input) return;
    input.classList.add('error');
    // Remove any existing error message sibling
    var prev = input.nextElementSibling;
    if (prev && prev.classList.contains('field-error')) prev.remove();
    // Insert inline message
    var span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = msg;
    input.insertAdjacentElement('afterend', span);
    // Clear error on next input event
    input.addEventListener('input', function clear() {
      input.classList.remove('error');
      var s = input.nextElementSibling;
      if (s && s.classList.contains('field-error')) s.remove();
      input.removeEventListener('input', clear);
    });
  };

  /**
   * Remove .error class and sibling message from all inputs in a container.
   * @param {HTMLElement} container - defaults to document.body
   */
  window.ohClearErrors = function (container) {
    var root = container || document.body;
    root.querySelectorAll('input.error, select.error, textarea.error').forEach(function (el) {
      el.classList.remove('error');
    });
    root.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
  };

  /* ---------- Calculating… button wrapper ---------- */

  function wrapButton(btn) {
    if (btn._ohWrapped) return;
    btn._ohWrapped = true;

    var originalText = btn.textContent.trim();

    // We intercept the native click (the page's own handler is already
    // attached; we add ours on capture so it runs first).
    btn.addEventListener('click', function onCalcClick(e) {
      // Add loading state immediately
      btn.classList.add('is-loading');
      btn.setAttribute('disabled', 'disabled');
      btn.textContent = 'Calculating…';

      // Let the page's own synchronous calc run in the next microtask,
      // then always restore the button.
      Promise.resolve().then(function () {
        // Give the browser one frame to paint the loading state
        requestAnimationFrame(function () {
          // Remove loading — the calc is synchronous so it has already run
          btn.classList.remove('is-loading');
          btn.removeAttribute('disabled');
          btn.textContent = originalText;
        });
      });
    }, true /* capture */);
  }

  /* ---------- Copied confirmation on copy/share buttons ---------- */

  function attachCopied(btn) {
    if (btn._ohCopied) return;
    btn._ohCopied = true;

    btn.addEventListener('click', function () {
      btn.classList.add('copied');
      var orig = btn.textContent.trim();
      btn.textContent = 'Copied!';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.textContent = orig;
      }, 1500);
    });
  }

  /* ---------- Init on DOMContentLoaded ---------- */

  function init() {
    document.querySelectorAll('.btn-calculate').forEach(wrapButton);
    document.querySelectorAll('.btn-copy, [data-copy]').forEach(attachCopied);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
