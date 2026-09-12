
document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const statusBanner = document.getElementById('statusBanner');
  const themeToggle = document.getElementById('themeToggle');
  const passageDisplay = document.getElementById('passageDisplay');

  let booksList = [];

  // ==========================================
  // GESTIÓN DE MODO OSCURO (Dark Mode)
  // ==========================================
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ==========================================
  // CARGA DE DATOS BIBLÍCOS
  // ==========================================
  async function loadManifest() {
    setLoadingState();

    try {
      const response = await fetch('./data/manifest.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // FIX CLAVE: Si data.books es Objeto, extraer llaves para no perder "id"
      if (Array.isArray(data.books)) {
        booksList = data.books;
      } else if (typeof data.books === 'object' && data.books !== null) {
        booksList = Object.entries(data.books).map(([key, value]) => ({
          id: key,
          ...value
        }));
      }

      if (!booksList.length) throw new Error('El manifest no contiene libros.');

      clearStatus();
      populateBooks();

    } catch (error) {
      showError('Error al cargar la lista de libros. Verifica tu servidor local o la ruta del archivo.', loadManifest);
    }
  }

  // ==========================================
  // POBLADO DINÁMICO DE SELECTORES
  // ==========================================
  function populateBooks() {
    const defaultOpt = new Option('-- Seleccionar Libro --', '');
    const options = booksList.map(b => new Option(b.name, b.id || b.code));

    bookSelect.replaceChildren(defaultOpt, ...options);
    bookSelect.disabled = false;
  }

  function updateChapters() {
    const selectedBookId = bookSelect.value;
    renderPassage(); // Actualizar vista inferior

    if (!selectedBookId) {
      resetSelect(chapterSelect, 'Selecciona un libro');
      resetSelect(verseSelect, 'Selecciona un capítulo');
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);
    const totalChapters = book?.chapters || book?.chapterCount || 0;

    if (totalChapters === 0) {
      resetSelect(chapterSelect, 'Sin capítulos');
      return;
    }

    const defaultOpt = new Option('-- Capítulo --', '');
    const options = Array.from({ length: totalChapters }, (_, i) => new Option(`Capítulo ${i + 1}`, i + 1));

    chapterSelect.replaceChildren(defaultOpt, ...options);
    chapterSelect.disabled = false;

    resetSelect(verseSelect, 'Selecciona un capítulo');
  }

  function updateVerses() {
  const selectedBookId = bookSelect.value;
  const chapterIdx = parseInt(chapterSelect.value, 10) - 1; // Base 0 para el arreglo

  if (!selectedBookId || isNaN(chapterIdx) || chapterIdx < 0) {
    resetSelect(verseSelect, 'Selecciona un capítulo');
    return;
  }

  const book = booksList.find(b => (b.id || b.code) === selectedBookId);
  
  // Extrae la cantidad exacta de versículos para ese capítulo
  const totalVerses = Array.isArray(book?.verseCounts) ? book.verseCounts[chapterIdx] : 0;

  if (totalVerses === 0) {
    resetSelect(verseSelect, 'Sin versículos');
    return;
  }

  const defaultOpt = new Option('-- Versículo --', '');
  const options = Array.from({ length: totalVerses }, (_, i) => new Option(`Versículo ${i + 1}`, i + 1));

  verseSelect.replaceChildren(defaultOpt, ...options);
  verseSelect.disabled = false;
}

  // ==========================================
  // VISTA INFERIOR (Salida Abajo)
  // ==========================================
  function renderPassage() {
    if (!passageDisplay) return;

    const bookId = bookSelect.value;
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;

    if (!bookId) {
      passageDisplay.classList.add('hidden');
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === bookId);
    let titleText = `${book?.name}`;
    
    if (chapter) titleText += ` ${chapter}`;
    if (verse) titleText += `:${verse}`;

    passageDisplay.classList.remove('hidden');
    passageDisplay.innerHTML = `
      <h3>${titleText}</h3>
      <p style="color: var(--text-muted)">Pasaje seleccionado correctamente.</p>
    `;
  }

  // ==========================================
  // HELPER FUNCTIONS & LISTENERS
  // ==========================================
  function resetSelect(selectEl, placeholder) {
    selectEl.replaceChildren(new Option(placeholder, ''));
    selectEl.disabled = true;
  }

  function setLoadingState() {
    resetSelect(bookSelect, 'Cargando libros...');
    resetSelect(chapterSelect, 'Selecciona un libro');
    resetSelect(verseSelect, 'Selecciona un capítulo');
  }

  function showError(message, retryFn) {
    statusBanner.className = 'status-banner error';
    statusBanner.innerHTML = `
      <span>⚠️ ${message}</span>
      <button type="button" class="retry-btn" id="retryBtn">Reintentar</button>
    `;
    statusBanner.classList.remove('hidden');
    document.getElementById('retryBtn')?.addEventListener('click', retryFn);
  }

  function clearStatus() {
    statusBanner.classList.add('hidden');
    statusBanner.innerHTML = '';
  }

  bookSelect.addEventListener('change', updateChapters);
  chapterSelect.addEventListener('change', updateVerses);
  verseSelect.addEventListener('change', renderPassage);

  loadManifest();
});
