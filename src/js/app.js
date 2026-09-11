/* Archivo: src/js/app.js */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const verseDisplay = document.getElementById('verseDisplay');
  const favList = document.getElementById('favList');
  const themeToggle = document.getElementById('themeToggle');

  let currentPassage = { book: '', chapter: 1, verse: 1, text: '' };

  // Inicialización asíncrona
  async function init() {
    try {
      // 1. Cargar el JSON primero (espera activa)
      await BibleRepository.init();

      // 2. Configurar la UI y los eventos
      populateBooks();
      loadFavorites();
      setupTheme();
      setupEventListeners();
    } catch (error) {
      if (verseDisplay) {
        verseDisplay.innerHTML = `<p class="error-msg">Error al cargar la Biblia. Revisa la consola o asegúrate de usar un servidor local.</p>`;
      }
    }
  }

  function populateBooks() {
    const books = BibleRepository.getBooks();
    if (!books || books.length === 0) return;

    bookSelect.innerHTML = books.map(b => `<option value="${b}">${b}</option>`).join('');
    updateChapters();
  }

  function updateChapters() {
    const count = BibleRepository.getChapterCount(bookSelect.value);
    chapterSelect.innerHTML = Array.from({ length: count }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    updateVerses();
  }

  function updateVerses() {
    // Genera del 1 al 30 por defecto o ajusta según tu estructura de datos
    verseSelect.innerHTML = Array.from({ length: 30 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    showCurrentVerse();
  }

  function showCurrentVerse() {
    const book = bookSelect.value;
    const chapter = parseInt(chapterSelect.value, 10) || 1;
    const verse = parseInt(verseSelect.value, 10) || 1;

    if (!book) return;

    const text = BibleRepository.getVerseText(book, chapter, verse);
    currentPassage = { book, chapter, verse, text };

    if (verseDisplay) {
      verseDisplay.innerHTML = `
        <div class="verse-card">
          <h3>${book} ${chapter}:${verse}</h3>
          <p class="verse-text">"${text}"</p>
        </div>
      `;
    }
  }

  function setupEventListeners() {
    // Reacción en cadena al cambiar cualquier selector
    bookSelect?.addEventListener('change', updateChapters);
    chapterSelect?.addEventListener('change', updateVerses);
    verseSelect?.addEventListener('change', showCurrentVerse);

    // Cambio de tema
    themeToggle?.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  function loadFavorites() {
    if (!favList) return;
    const favorites = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    
    if (favorites.length === 0) {
      favList.innerHTML = '<li class="empty">No hay pasajes favoritos</li>';
      return;
    }

    favList.innerHTML = favorites.map(f => `
      <li><strong>${f.book} ${f.chapter}:${f.verse}</strong> - ${f.text.substring(0, 40)}...</li>
    `).join('');
  }

  function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }

  // Ejecutar inicialización
  init();
});
