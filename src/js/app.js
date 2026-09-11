/**
 * Controlador Principal del Selector Bíblico
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Elementos DOM
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const verseDisplay = document.getElementById('verseDisplay');
  const errorMessage = document.getElementById('errorMessage');
  const favList = document.getElementById('favList');
  const themeToggle = document.getElementById('themeToggle');
  const ayudaLocal = document.getElementById('ayudaLocal');

  const showBtn = document.getElementById('showBtn');
  const randomBtn = document.getElementById('randomBtn');
  const copyBtn = document.getElementById('copyBtn');
  const favBtn = document.getElementById('favBtn');

  // Estado Actual
  let currentSelection = { book: '', chapter: 1, verse: 1, text: '' };

  // Inicializar Tema
  const currentTheme = StorageUtil.getTheme();
  StorageUtil.setTheme(currentTheme);
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

  // Cargar Datos
  try {
    await BibleRepository.init();
    populateBooks();
    renderFavorites();
  } catch (err) {
    showError('Error al cargar la base de datos bíblica.');
    if (window.location.protocol === 'file:') {
      ayudaLocal.hidden = false;
    }
    return;
  }

  // --- POPULAR SELECTS ---
  function populateBooks() {
    const books = BibleRepository.getBooks();
    bookSelect.innerHTML = books.map(b => `<option value="${b}">${b}</option>`).join('');
    updateChapters();
  }

  function updateChapters() {
    const selectedBook = bookSelect.value;
    const count = BibleRepository.getChapterCount(selectedBook);
    chapterSelect.innerHTML = Array.from({ length: count }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    updateVerses();
  }

  function updateVerses() {
    // Para simplificar la muestra, cargamos hasta 30 versículos por capítulo
    verseSelect.innerHTML = Array.from({ length: 30 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  }

  // --- RENDERIZADO Y ACCIONES ---
  function displayVerse(book, chapter, verse) {
    showError('');
    const text = BibleRepository.getVerseText(book, chapter, verse);
    currentSelection = { book, chapter, verse, text };

    verseDisplay.innerHTML = `
      <p class="verse-text">"${text}"</p>
      <span class="verse-ref">— ${book} ${chapter}:${verse}</span>
    `;
  }

  function showError(msg) {
    errorMessage.textContent = msg;
  }

  function renderFavorites() {
    const favs = StorageUtil.getFavorites();
    if (favs.length === 0) {
      favList.innerHTML = '<li><em>No hay favoritos guardados.</em></li>';
      return;
    }

    favList.innerHTML = favs.map((item, index) => `
      <li class="favorite-item">
        <div>
          <strong>${item.book} ${item.chapter}:${item.verse}</strong>: "${item.text}"
        </div>
        <button type="button" aria-label="Eliminar favorito" data-index="${index}">Eliminar</button>
      </li>
    `).join('');

    favList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        StorageUtil.removeFavorite(idx);
        renderFavorites();
      });
    });
  }

  // --- EVENT LISTENERS ---
  bookSelect.addEventListener('change', updateChapters);
  chapterSelect.addEventListener('change', updateVerses);

  showBtn.addEventListener('click', () => {
    displayVerse(bookSelect.value, parseInt(chapterSelect.value, 10), parseInt(verseSelect.value, 10));
  });

  randomBtn.addEventListener('click', () => {
    const random = BibleRepository.getRandomPassage();
    bookSelect.value = random.book;
    updateChapters();
    chapterSelect.value = random.chapter;
    updateVerses();
    verseSelect.value = random.verse;
    displayVerse(random.book, random.chapter, random.verse);
  });

  copyBtn.addEventListener('click', async () => {
    if (!currentSelection.text) return;
    const formatted = `"${currentSelection.text}" - ${currentSelection.book} ${currentSelection.chapter}:${currentSelection.verse}`;
    try {
      await ClipboardUtil.copyText(formatted);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '¡Copiado! ✓';
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    } catch {
      showError('No se pudo copiar el texto.');
    }
  });

  favBtn.addEventListener('click', () => {
    if (!currentSelection.text) return;
    const added = StorageUtil.saveFavorite(currentSelection);
    if (added) {
      renderFavorites();
    } else {
      showError('El versículo ya está en tus favoritos.');
    }
  });

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    StorageUtil.setTheme(nextTheme);
    themeToggle.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
  });

  // Mostrar el primer versículo por defecto
  showBtn.click();
});
