/* ============================================================
   UTILIDADES SEGURAS
   ============================================================ */
const $ = id => document.getElementById(id);

const escapeHTML = str => String(str).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const showError = msg => { $('error').textContent = msg; };
const clearError = () => { $('error').textContent = ''; };
