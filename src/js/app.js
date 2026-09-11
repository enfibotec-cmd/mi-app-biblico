/* ============================================================
   SELECTOR BÍBLICO — Lógica de aplicación (Adaptada a 66 libros)
   ============================================================ */
(function () {
  'use strict';

  // 🛡️ FALLBACK: Datos integrados para que la app funcione 100% offline
  // si el usuario abre el archivo directamente sin servidor local.
  const FALLBACK_DATA = {
    books: {
      "Génesis": { "chapters": 50, "sample": { "1-1": "En el principio creó Dios los cielos y la tierra." } },
      "Salmos": { "chapters": 150, "sample": { "23-1": "Jehová es mi pastor, nada me faltará." } },
      "Juan": { "chapters": 21, "sample": { "3-16": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito." } },
      "Filipenses": { "chapters": 4, "sample": { "4-13": "Todo lo puedo en Cristo que me fortalece." } },
      "Apocalipsis": { "chapters": 22, "sample": { "3-20": "He aquí, yo estoy a la puerta y llamo." } }
      // (El fetch intentará cargar los 66 libros desde data/biblia.json primero)
    }
  };

  let BIBLE_DATA = FALLBACK_DATA;
  const state = { currentBook: null, currentChapter: null, currentVerse: null, currentText: '', favorites: [], theme: 'light' };

  // ---------- UTILIDADES ----------
  const $ = (sel) => document.querySelector(sel);
  const storage = {
    get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn('Storage error:', e); } }
  };

  let toastTimer;
  function toast(msg, type = '') {
    const t = $('#toast'), m = $('#toastMsg');
    m.textContent = msg;
    t.className = `toast show ${type}`.trim();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 2500);
  }

  // ---------- CARGA DE DATOS ----------
  async function initBibleData() {
    try {
      const response = await fetch('data/biblia.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      BIBLE_DATA = await response.json();
      console.log('✅ Datos bíblicos cargados desde data/biblia.json');
    } catch (error) {
      console.warn('⚠️ Usando datos bíblicos en caché (modo offline).', error);
    }
    populateBooks();
  }

  function populateBooks() {
    const sel = $('#book');
    sel.innerHTML = '<option value="">— Selecciona un libro —</option>';
    Object.keys(BIBLE_DATA.books).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  }

  function populateChapters(bookName) {
    const sel = $('#chapter');
    sel.innerHTML = '<option value="">— Selecciona capítulo —</option>';
    const total = BIBLE_DATA.books[bookName]?.chapters || 0;
    for (let i = 1; i <= total; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      sel.appendChild(opt);
    }
    sel.disabled = false;
    $('#verse').disabled = true;
    $('#verse').innerHTML = '<option value="">—</option>';
  }

  function populateVerses(bookName, chapter) {
    const sel = $('#verse');
    sel.innerHTML = '<option value="">— Selecciona versículo —</option>';
    // Si no tenemos el conteo exacto de versículos, usamos 50 como límite seguro de UX
    const maxVerses = BIBLE_DATA.books[bookName]?.chapterVerses?.[chapter] || 50;
    for (let i = 1; i <= maxVerses; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      sel.appendChild(opt);
    }
    sel.disabled = false;
  }

  // ---------- LÓGICA DE VERSÍCULOS ----------
  function getVerseText(book, chapter, verse) {
    const bookData = BIBLE_DATA.books[book];
    if (!bookData) return 'Libro no encontrado.';
    
    const sampleKey = `${chapter}-${verse}`;
    if (bookData.sample && bookData.sample[sampleKey]) {
      return bookData.sample[sampleKey];
    }
    
    // Fallback elegante para versículos no incluidos en la muestra
    return `(Texto de muestra para ${book} ${chapter}:${verse}. Para el texto completo, integra una API bíblica o expande el archivo data/biblia.json con todos los versículos).`;
  }

  function showVerse() {
    const book = $('#book').value, chapter = $('#chapter').value, verse = $('#verse').value;
    if (!book || !chapter || !verse) {
      toast('Selecciona libro, capítulo y versículo', 'error');
      return;
    }

    const display = $('#verseDisplay');
    display.setAttribute('aria-busy', 'true');
    display.innerHTML = `<div class="skeleton title"></div><div class="skeleton line-1"></div><div class="skeleton line-2"></div>`;

    setTimeout(() => {
      state.currentBook = book;
      state.currentChapter = chapter;
      state.currentVerse = verse;
      state.currentText = getVerseText(book, chapter, verse);

      display.setAttribute('aria-busy', 'false');
      display.dataset.state = 'loaded';
      display.innerHTML = `
        <div class="verse-ref">${book} ${chapter}:${verse}</div>
        <div class="verse-text">"${state.currentText}"</div>
      `;
      $('#btnCopy').disabled = false;
      $('#btnFavorite').disabled = false;
      setTimeout(() => { display.dataset.state = ''; }, 500);
    }, 300);
  }

  function randomVerse() {
    const books = Object.keys(BIBLE_DATA.books);
    const book = books[Math.floor(Math.random() * books.length)];
    const maxCh = BIBLE_DATA.books[book].chapters;
    const chapter = Math.floor(Math.random() * maxCh) + 1;
    const verse = Math.floor(Math.random() * 30) + 1; // Versículo aleatorio seguro

    $('#book').value = book;
    populateChapters(book);
    $('#chapter').value = chapter;
    populateVerses(book, chapter);
    $('#verse').value = Math.min(verse, 50); // Asegurar que esté en el rango del select
    showVerse();
  }

  // ---------- ACCIONES ----------
  async function copyVerse() {
    if (!state.currentText) return;
    const full = `${state.currentBook} ${state.currentChapter}:${state.currentVerse}\n"${state.currentText}"`;
    try {
      await navigator.clipboard.writeText(full);
      toast('✓ Versículo copiado', 'success');
    } catch {
      toast('No se pudo copiar automáticamente', 'error');
    }
  }

  function saveFavorite() {
    if (!state.currentText) return;
    const key = `${state.currentBook}-${state.currentChapter}-${state.currentVerse}`;
    if (state.favorites.some(f => f.key === key)) return toast('Ya está en favoritos', 'error');
    
    state.favorites.unshift({ key, ref: `${state.currentBook} ${state.currentChapter}:${state.currentVerse}`, text: state.currentText, date: Date.now() });
    storage.set('favorites', state.favorites);
    renderFavorites();
    toast('⭐ Guardado en favoritos', 'success');
  }

  function removeFavorite(key) {
    state.favorites = state.favorites.filter(f => f.key !== key);
    storage.set('favorites', state.favorites);
    renderFavorites();
  }

  function renderFavorites() {
    const list = $('#favoritesList'), btnClear = $('#btnClearFav');
    if (state.favorites.length === 0) {
      list.innerHTML = '<li class="empty-state">Aún no has guardado ningún versículo.</li>';
      btnClear.hidden = true;
      return;
    }
    btnClear.hidden = false;
    list.innerHTML = state.favorites.map(f => `
      <li class="favorite-item" data-key="${f.key}">
        <div class="fav-content">
          <div class="fav-ref">${f.ref}</div>
          <div class="fav-text">"${f.text}"</div>
        </div>
        <div class="fav-actions">
          <button type="button" class="btn-fav-copy" data-key="${f.key}" aria-label="Copiar">📋</button>
          <button type="button" class="btn-fav-delete" data-key="${f.key}" aria-label="Eliminar">🗑️</button>
        </div>
      </li>
    `).join('');
  }

  // ---------- EVENTOS ----------
  function init() {
    initTheme();
    initBibleData();
    state.favorites = storage.get('favorites', []);
    renderFavorites();

    $('#themeToggle').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      storage.set('theme', state.theme);
      document.documentElement.dataset.theme = state.theme;
      $('.theme-icon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
    });

    $('#verseForm').addEventListener('submit', (e) => { e.preventDefault(); showVerse(); });
    $('#btnRandom').addEventListener('click', randomVerse);
    $('#btnCopy').addEventListener('click', copyVerse);
    $('#btnFavorite').addEventListener('click', saveFavorite);
    $('#btnClearFav').addEventListener('click', () => {
      if (confirm('¿Borrar todos los favoritos?')) {
        state.favorites = [];
        storage.set('favorites', []);
        renderFavorites();
        toast('Favoritos borrados');
      }
    });

    $('#favoritesList').addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.btn-fav-copy');
      const delBtn = e.target.closest('.btn-fav-delete');
      if (copyBtn) {
        const f = state.favorites.find(x => x.key === copyBtn.dataset.key);
        if (f) navigator.clipboard?.writeText(`${f.ref}\n"${f.text}"`).then(() => toast('✓ Copiado', 'success'));
      }
      if (delBtn) removeFavorite(delBtn.dataset.key);
    });

    $('#book').addEventListener('change', (e) => {
      if (e.target.value) populateChapters(e.target.value);
      else { $('#chapter').disabled = true; $('#verse').disabled = true; }
    });
    $('#chapter').addEventListener('change', (e) => {
      if (e.target.value && $('#book').value) populateVerses($('#book').value, e.target.value);
      else $('#verse').disabled = true;
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select, textarea')) return;
      if (e.key.toLowerCase() === 't') { $('#themeToggle').click(); e.preventDefault(); }
      else if (e.key.toLowerCase() === 'r') { randomVerse(); e.preventDefault(); }
      else if (e.key.toLowerCase() === 'c' && state.currentText) { copyVerse(); e.preventDefault(); }
    });
  }

  function initTheme() {
    const saved = storage.get('theme', null);
    state.theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = state.theme;
    $('.theme-icon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
