/* ============================================================
   INICIALIZACIÓN DE SELECTORES
   ============================================================ */
const books = Object.keys(BIBLIA).sort((a, b) => a.localeCompare(b, 'es'));
const bookSel = $('book'), chapSel = $('chapter'), verSel = $('verse');

function populateBooks() {
  bookSel.innerHTML = '<option value="">-- Libro --</option>' +
    books.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join('');
}

function populateChapters(book) {
  if (!book || !BIBLIA[book]) {
    chapSel.innerHTML = '<option value="">-- Capítulo --</option>';
    return;
  }
  const chapters = Object.keys(BIBLIA[book]).map(Number).sort((a, b) => a - b);
  chapSel.innerHTML = '<option value="">-- Capítulo --</option>' +
    chapters.map(c => `<option value="${c}">${c}</option>`).join('');
}

function populateVerses(book, chapter) {
  if (!book || !chapter || !BIBLIA[book]?.[chapter]) {
    verSel.innerHTML = '<option value="">-- Versículo --</option>';
    return;
  }
  const verses = Object.keys(BIBLIA[book][chapter]).map(Number).sort((a, b) => a - b);
  verSel.innerHTML = '<option value="">-- Versículo --</option>' +
    verses.map(v => `<option value="${v}">${v}</option>`).join('');
}

bookSel.addEventListener('change', () => {
  populateChapters(bookSel.value);
  populateVerses('', '');
});
chapSel.addEventListener('change', () => populateVerses(bookSel.value, chapSel.value));

/* ============================================================
   MOSTRAR VERSÍCULO
   ============================================================ */
function displayVerse(book, chapter, verse) {
  clearError();
  if (!book) return showError('Selecciona un libro.');
  if (!chapter) return showError('Selecciona un capítulo.');
  if (!verse) return showError('Selecciona un versículo.');
  const text = BIBLIA[book]?.[chapter]?.[verse];
  if (!text) return showError('Versículo no disponible en la muestra.');
  $('verseDisplay').innerHTML =
    `"${escapeHTML(text)}"<span class="verse-ref">— ${escapeHTML(book)} ${chapter}:${verse}</span>`;
}

$('showBtn').addEventListener('click', () => {
  displayVerse(bookSel.value, chapSel.value, verSel.value);
});

/* ============================================================
   VERSÍCULO ALEATORIO
   ============================================================ */
function randomVerse() {
  const b = books[Math.floor(Math.random() * books.length)];
  const chapters = Object.keys(BIBLIA[b]).map(Number);
  const c = chapters[Math.floor(Math.random() * chapters.length)];
  const verses = Object.keys(BIBLIA[b][c]).map(Number);
  const v = verses[Math.floor(Math.random() * verses.length)];
  bookSel.value = b;
  populateChapters(b);
  chapSel.value = c;
  populateVerses(b, c);
  verSel.value = v;
  displayVerse(b, c, v);
}
$('randomBtn').addEventListener('click', randomVerse);

/* ============================================================
   FAVORITOS (localStorage, con validación)
   ============================================================ */
const FAV_KEY = 'biblia_favoritos_v1';

function loadFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(f =>
      f && typeof f === 'object' &&
      typeof f.book === 'string' &&
      Number.isInteger(f.chapter) &&
      Number.isInteger(f.verse) &&
      BIBLIA[f.book]?.[f.chapter]?.[f.verse]
    );
  } catch { return []; }
}

function saveFavs(favs) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); }
  catch { showError('No se pudo guardar (almacenamiento bloqueado).'); }
}

function renderFavs() {
  const favs = loadFavs();
  const ul = $('favList');
  if (!favs.length) {
    ul.innerHTML = '<li class="empty">Aún no tienes favoritos guardados.</li>';
    return;
  }
  ul.innerHTML = favs.map((f, i) => `
    <li data-idx="${i}" tabindex="0" role="button"
        aria-label="Cargar ${escapeHTML(f.book)} ${f.chapter}:${f.verse}">
      <span>${escapeHTML(f.book)} ${f.chapter}:${f.verse}</span>
      <button class="fav-remove" data-idx="${i}" aria-label="Eliminar favorito">×</button>
    </li>`).join('');
}

$('favBtn').addEventListener('click', () => {
  const b = bookSel.value, c = parseInt(chapSel.value), v = parseInt(verSel.value);
  if (!b || !c || !v) return showError('Selecciona un versículo antes de guardar.');
  if (!BIBLIA[b]?.[c]?.[v]) return showError('Versículo no disponible.');
  const favs = loadFavs();
  if (favs.some(f => f.book === b && f.chapter === c && f.verse === v)) {
    return showError('Este versículo ya está en favoritos.');
  }
  favs.push({ book: b, chapter: c, verse: v });
  saveFavs(favs);
  renderFavs();
  clearError();
});

$('favList').addEventListener('click', e => {
  const removeBtn = e.target.closest('.fav-remove');
  const item = e.target.closest('li[data-idx]');
  if (removeBtn) {
    const idx = parseInt(removeBtn.dataset.idx);
    const favs = loadFavs();
    favs.splice(idx, 1);
    saveFavs(favs);
    renderFavs();
  } else if (item) {
    const idx = parseInt(item.dataset.idx);
    const f = loadFavs()[idx];
    if (!f) return;
    bookSel.value = f.book;
    populateChapters(f.book);
    chapSel.value = f.chapter;
    populateVerses(f.book, f.chapter);
    verSel.value = f.verse;
    displayVerse(f.book, f.chapter, f.verse);
  }
});

/* ============================================================
   TEMA CLARO / OSCURO (persistente)
   ============================================================ */
const THEME_KEY = 'biblia_tema';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('themeToggle').textContent = theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
}

$('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch {}
});

try { applyTheme(localStorage.getItem(THEME_KEY) || 'light'); }
catch { applyTheme('light'); }

/* ============================================================
   ARRANQUE
   ============================================================ */
populateBooks();
renderFavs();
