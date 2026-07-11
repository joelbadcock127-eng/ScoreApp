/*
 * Scorecard embed script. Drop the snippet from Settings → Embed into any
 * web page. The container element carries data attributes:
 *   data-sa-url          scorecard URL (required)
 *   data-sa-view         full | inline | popup | chat
 *   data-sa-auto-height  "1" to stretch the inline iframe to the viewport
 *   data-sa-width        inline width, e.g. "100%" or "640px"
 *   data-sa-size         popup size: full | large | medium
 *   data-sa-button-text  popup/chat launcher label
 *   data-sa-button-bg-color / data-sa-button-color
 *   data-sa-font-size    launcher font size (px)
 *   data-sa-radius       popup launcher corner radius (px)
 *   data-sa-icon         chat launcher image URL
 *   data-sa-auto-open    chat: seconds before auto-opening ("0" = never)
 */
(function () {
  'use strict';

  function makeIframe(url) {
    var f = document.createElement('iframe');
    f.src = url;
    f.style.border = '0';
    f.style.width = '100%';
    f.style.height = '100%';
    f.setAttribute('allow', 'clipboard-write');
    f.setAttribute('title', 'Scorecard');
    return f;
  }

  function overlay(url, size, onClose) {
    var wrap = document.createElement('div');
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:999999;background:rgba(12,13,13,.55);display:flex;align-items:center;justify-content:center;padding:' +
      (size === 'full' ? '0' : '24px');
    var box = document.createElement('div');
    var dims =
      size === 'medium'
        ? 'width:640px;max-width:96vw;height:78vh;'
        : size === 'large'
          ? 'width:960px;max-width:98vw;height:88vh;'
          : 'width:100%;height:100%;';
    box.style.cssText = dims + 'position:relative;background:#fff;border-radius:' + (size === 'full' ? '0' : '12px') + ';overflow:hidden;';
    var close = document.createElement('button');
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Close');
    close.style.cssText =
      'position:absolute;top:10px;right:12px;z-index:2;width:34px;height:34px;border:0;border-radius:50%;background:rgba(12,13,13,.65);color:#fff;font-size:20px;cursor:pointer;line-height:1;';
    close.onclick = function () {
      document.body.removeChild(wrap);
      if (onClose) onClose();
    };
    box.appendChild(makeIframe(url));
    box.appendChild(close);
    wrap.appendChild(box);
    document.body.appendChild(wrap);
  }

  function init(el) {
    if (el.getAttribute('data-sa-done')) return;
    el.setAttribute('data-sa-done', '1');
    var url = el.getAttribute('data-sa-url');
    if (!url) return;
    var view = el.getAttribute('data-sa-view') || 'inline';
    var btnBg = el.getAttribute('data-sa-button-bg-color') || '#1c78fe';
    var btnFg = el.getAttribute('data-sa-button-color') || '#ffffff';
    var btnText = el.getAttribute('data-sa-button-text') || 'Start the quiz';
    var fontSize = parseInt(el.getAttribute('data-sa-font-size') || '16', 10);

    if (view === 'full') {
      var f = makeIframe(url);
      f.style.width = '100vw';
      f.style.height = '100vh';
      f.style.display = 'block';
      el.appendChild(f);
      return;
    }

    if (view === 'inline') {
      var width = el.getAttribute('data-sa-width') || '100%';
      var inline = makeIframe(url);
      inline.style.width = width;
      inline.style.height = el.getAttribute('data-sa-auto-height') === '1' ? '92vh' : el.getAttribute('data-sa-height') || '700px';
      el.appendChild(inline);
      return;
    }

    if (view === 'popup') {
      var size = el.getAttribute('data-sa-size') || 'full';
      var radius = parseInt(el.getAttribute('data-sa-radius') || '5', 10);
      var b = document.createElement('button');
      b.textContent = btnText;
      b.style.cssText =
        'box-sizing:border-box;min-width:10rem;padding:.75rem 2rem;background-color:' +
        btnBg +
        ';color:' +
        btnFg +
        ';font-size:' +
        fontSize +
        'px;cursor:pointer;text-align:center;border:none;border-radius:' +
        radius +
        'px;font-family:inherit;line-height:1.5;';
      b.onclick = function () {
        overlay(url, size);
      };
      el.appendChild(b);
      return;
    }

    if (view === 'chat') {
      var open = false;
      var win = null;
      var icon = el.getAttribute('data-sa-icon');
      var autoOpen = parseInt(el.getAttribute('data-sa-auto-open') || '0', 10);
      var launcher = document.createElement('button');
      launcher.style.cssText =
        'position:fixed;right:20px;bottom:20px;z-index:999998;display:flex;align-items:center;gap:.5rem;padding:.7rem 1.3rem;border:none;border-radius:999px;background:' +
        btnBg +
        ';color:' +
        btnFg +
        ';font-size:' +
        fontSize +
        'px;cursor:pointer;box-shadow:0 6px 24px rgba(12,13,13,.25);font-family:inherit;';
      if (icon) {
        var img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        img.style.cssText = 'width:20px;height:20px;object-fit:contain;';
        launcher.appendChild(img);
      }
      launcher.appendChild(document.createTextNode(btnText));

      function toggle() {
        if (open && win) {
          document.body.removeChild(win);
          win = null;
          open = false;
          return;
        }
        win = document.createElement('div');
        win.style.cssText =
          'position:fixed;right:20px;bottom:84px;z-index:999999;width:380px;max-width:calc(100vw - 40px);height:600px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(12,13,13,.3);';
        win.appendChild(makeIframe(url));
        document.body.appendChild(win);
        open = true;
      }

      launcher.onclick = toggle;
      document.body.appendChild(launcher);
      if (autoOpen > 0) setTimeout(function () { if (!open) toggle(); }, autoOpen * 1000);
    }
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-sa-url]');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
