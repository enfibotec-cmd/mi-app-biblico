/* src/js/app.js */

  document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const statusBanner = document.getElementById('statusBanner');

  let booksList = [];

  // 1. Cargar datos con manejo explícito de errores
  async function loadManifest() {
    showLoadingState();

    try {
      const response = await fetch('./data/manifest.json', { cache: 'force-cache' });
      
      if (!response.ok) {
        throw new Error(`Respuesta del servidor no válida (HTTP ${response.status})`);
      }

      const data = await response.json();
      booksList = Array.isArray(data.books) ? data.books : Object.values(data.books || {});

      if (!booksList.length) {
        throw new Error('El archivo manifest no contiene libros válidos.');
      }

      // Si todo fue correcto:
      clearStatus();
      populateBooks();

    } catch (error) {
      showErrorState(
        'No pudimos cargar los datos bíblicos. Revisa que el servidor local esté activo o la ruta del archivo manifest.',
        loadManifest
      );
    }
  }

  // --- GESTORES DE ESTADO UI ---

  function showLoadingState() {
    statusBanner.classList.add('hidden');
    bookSelect.disabled = true;
    chapterSelect.disabled = true;
    verseSelect.disabled = true;

    bookSelect.replaceChildren(new Option('Cargando libros...', ''));
    chapterSelect.replaceChildren(new Option('Selecciona un libro', ''));
    verseSelect.replaceChildren(new Option('Selecciona un capítulo', ''));
  }

  function showErrorState(message, retryCallback) {
    statusBanner.className = 'status-banner error';
    statusBanner.innerHTML = `
      <span>⚠️ ${message}</span>
      <button type="button" class="retry-btn" id="retryBtn">Reintentar</button>
    `;

    document.getElementById('retryBtn')?.addEventListener('click', retryCallback);

    bookSelect.replaceChildren(new Option('Error al cargar', ''));
    bookSelect.disabled = true;
    chapterSelect.disabled = true;
    verseSelect.disabled = true;
  }

  function clearStatus() {
    statusBanner.classList.add('hidden');
    statusBanner.innerHTML = '';
  }

  // --- LLENADO DINÁMICO DE SELECTORES ---

  function populateBooks() {
    const defaultOption = new Option('-- Selecciona un libro --', '');
    const options = booksList.map(b => new Option(b.name, b.id || b.code));
    
    bookSelect.replaceChildren(defaultOption, ...options);
    bookSelect.disabled = false;
  }

  function updateChapters() {
    const selectedBookId = bookSelect.value;
    
    if (!selectedBookId) {
      chapterSelect.replaceChildren(new Option('Selecciona un libro', ''));
      verseSelect.replaceChildren(new Option('Selecciona un capítulo', ''));
      chapterSelect.disabled = true;
      verseSelect.disabled = true;
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);
    const count = book?.chapters || book?.chapterCount || 0;

    const defaultOption = new Option('-- Capítulo --', '');
    const options = Array.from({ length: count }, (_, i) => new Option(`Capítulo ${i + 1}`, i + 1));

    chapterSelect.replaceChildren(defaultOption, ...options);
    chapterSelect.disabled = false;

    // Resetear selector de versículos
    verseSelect.replaceChildren(new Option('Selecciona un capítulo', ''));
    verseSelect.disabled = true;
  }

  function updateVerses() {
    const selectedBookId = bookSelect.value;
    const chapterIdx = parseInt(chapterSelect.value, 10) - 1;

    if (!selectedBookId || isNaN(chapterIdx) || chapterIdx < 0) {
      verseSelect.replaceChildren(new Option('Selecciona un capítulo', ''));
      verseSelect.disabled = true;
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);
    const count = Array.isArray(book?.verseCounts) ? book.verseCounts[chapterIdx] : 0;

    const defaultOption = new Option('-- Versículo --', '');
    const options = Array.from({ length: count }, (_, i) => new Option(`Versículo ${i + 1}`, i + 1));

    verseSelect.replaceChildren(defaultOption, ...options);
    verseSelect.disabled = false;
  }

  // Eventos de escucha
  bookSelect.addEventListener('change', updateChapters);
  chapterSelect.addEventListener('change', updateVerses);

  // Inicialización
  loadManifest();
});
