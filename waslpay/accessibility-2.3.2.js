/* WaslPay 2.3.2 — small accessibility polish for the local preview only. */
'use strict';
(() => {
  const labels = {
    '.message-trigger': 'فتح رسائل المحفظة',
    '[data-action="requests"]': 'فتح طلبات الأسرة',
    '[data-platform-action="install"]': 'تثبيت وَصْل كتطبيق ويب',
    '#paymentLiveOpen': 'عرض تفاصيل الحركة الأخيرة'
  };
  const apply = root => {
    Object.entries(labels).forEach(([selector, label]) => {
      root.querySelectorAll(selector).forEach(el => {
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
      });
    });
    root.querySelectorAll('button, a, input, select, textarea').forEach(el => {
      if (!el.getAttribute('title') && el.matches('button[aria-label]')) el.setAttribute('title', el.getAttribute('aria-label'));
    });
  };
  apply(document);
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); }))).observe(document.body, { childList: true, subtree: true });
})();
