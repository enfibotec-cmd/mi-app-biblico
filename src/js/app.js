document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const statusBanner = document.getElementById('statusBanner');
  const themeToggle = document.getElementById('themeToggle');
  const passageDisplay = document.getElementById('passageDisplay');

  let booksList = [];

  // ==========================================
  // 1. GESTIÓN DE MODO OSCURO (Dark Mode)
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
  // 2. CARGA DE DATOS BIBLÍCOS CON CONTROL DE CACHÉ
  // ==========================================
  async function loadManifest() {
    setLoadingState();

    try {
      // Se añade timestamp para evitar que el navegador use un manifest.json viejo en caché
      const response = await fetch(`./data/manifest.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Mapeo flexible: soporta si "books" es un Objeto o un Array
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
      console.error(error);
      showError('Error al cargar la lista de libros. Revisa la ruta de manifest.json.', loadManifest);
    }
  }

  // ==========================================
  // 3. POBLADO Y ACTUALIZACIÓN DE SELECTORES
  // ==========================================
  function populateBooks() {
    const defaultOpt = new Option('-- Seleccionar Libro --', '');
    const options = booksList.map(b => new Option(b.name, b.id || b.code));

    bookSelect.replaceChildren(defaultOpt, ...options);
    bookSelect.disabled = false;
  }

  function updateChapters() {
    const selectedBookId = bookSelect.value;
    renderPassage();

    if (!selectedBookId) {
      resetSelect(chapterSelect, 'Selecciona un libro');
      resetSelect(verseSelect, 'Selecciona un capítulo');
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);
    const totalChapters = book?.chapters || book?.chapterCount || 0;

    if (totalChapters === 0) {
      resetSelect(chapterSelect, 'Sin capítulos');
      resetSelect(verseSelect, 'Sin versículos');
      return;
    }

    const defaultOpt = new Option('-- Capítulo --', '');
    const options = Array.from({ length: totalChapters }, (_, i) => new Option(`Capítulo ${i + 1}`, i + 1));

    chapterSelect.replaceChildren(defaultOpt, ...options);
    chapterSelect.disabled = false;

    // Reiniciar versículos al cambiar de libro
    resetSelect(verseSelect, 'Selecciona un capítulo');
  }

  function updateVerses() {
    const selectedBookId = bookSelect.value;
    const chapterVal = chapterSelect.value;
    renderPassage();

    if (!selectedBookId || !chapterVal) {
      resetSelect(verseSelect, 'Selecciona un capítulo');
      return;
    }

    const chapterNum = parseInt(chapterVal, 10);
    const chapterIdx = chapterNum - 1; // Índice base 0

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);

    if (!book) {
      resetSelect(verseSelect, 'Error de libro');
      return;
    }

    let totalVerses = 0;

    // 1. Intentar obtener el conteo exacto desde el arreglo verseCounts
    if (Array.isArray(book.verseCounts) && book.verseCounts[chapterIdx] !== undefined) {
      totalVerses = book.verseCounts[chapterIdx];
    } 
    // 2. FALLBACK: Si no existe verseCounts en el JSON, asigna un número por defecto para no bloquear la interfaz
    else {
      console.warn(`[Biblia] 'verseCounts' no encontrado para ${book.name} (Cap. ${chapterNum}). Aplicando respaldo de 50 versículos.`);
      totalVerses = 50; 
    }

    if (totalVerses <= 0) {
      resetSelect(verseSelect, 'Sin versículos');
      return;
    }

    const defaultOpt = new Option('-- Versículo --', '');
    const options = Array.from({ length: totalVerses }, (_, i) => new Option(`Versículo ${i + 1}`, i + 1));

    verseSelect.replaceChildren(defaultOpt, ...options);
    verseSelect.disabled = false;
  }

  // ==========================================
  // 4. MUESTRA EN PANTALLA (Salida Inferior)
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
    let titleText = `${book?.name || ''}`;
    
    if (chapter) titleText += ` ${chapter}`;
    if (verse) titleText += `:${verse}`;

    passageDisplay.classList.remove('hidden');
    passageDisplay.innerHTML = `
      <h3>${titleText}</h3>
      <p style="color: var(--text-muted)">Pasaje seleccionado correctamente.</p>
    `;
  }

  // ==========================================
  // 5. FUNCIONES AUXILIARES Y EVENTOS
  // ==========================================
  function resetSelect(selectEl, placeholder) {
    if (!selectEl) return;
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

  // Escuchadores de eventos
  bookSelect.addEventListener('change', updateChapters);
  chapterSelect.addEventListener('change', updateVerses);
  verseSelect.addEventListener('change', renderPassage);

  // Iniciar la carga
  loadManifest();
});
