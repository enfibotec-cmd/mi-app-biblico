'use strict'; // Forzamos modo estricto para capturar errores silenciosos

document.addEventListener('DOMContentLoaded', () => {
  // 1. VALIDACIÓN DE DEPENDENCIAS DOM (ID-02)
  const elements = {
    bookSelect: document.getElementById('bookSelect'),
    chapterSelect: document.getElementById('chapterSelect'),
    verseSelect: document.getElementById('verseSelect'),
    statusBanner: document.getElementById('statusBanner'),
    themeToggle: document.getElementById('themeToggle'),
    passageDisplay: document.getElementById('passageDisplay')
  };

  // Si faltan elementos críticos, detenemos la ejecución de forma controlada
  if (!elements.bookSelect || !elements.chapterSelect || !elements.verseSelect) {
    console.error('[Biblia App] Faltan elementos críticos del DOM. Verifica el HTML.');
    return;
  }

  let booksList = [];
  const DEFAULT_VERSE_FALLBACK = 50; // (ID-04) Constante en lugar de número mágico

  // ==========================================
  // 1. GESTIÓN DE MODO OSCURO (Dark Mode)
  // ==========================================
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  elements.themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (elements.themeToggle) {
      // textContent es seguro contra XSS
      elements.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ==========================================
  // 2. CARGA DE DATOS BÍBLICOS CON CONTROL DE CACHÉ
  // ==========================================
  async function loadManifest() {
    setLoadingState();

    try {
      const response = await fetch(`./data/manifest.json?v=${Date.now()}`, { 
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

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
      console.error('[Biblia App] Error cargando manifest:', error);
      showError('Error al cargar la lista de libros. Revisa la ruta de manifest.json.', loadManifest);
    }
  }

  // ==========================================
  // 3. POBLADO Y ACTUALIZACIÓN DE SELECTORES
  // ==========================================
  function populateBooks() {
    elements.bookSelect.replaceChildren();
    elements.bookSelect.appendChild(new Option('-- Seleccionar Libro --', ''));

    const groupOT = document.createElement('optgroup');
    groupOT.label = '— Antiguo Testamento —';
    const groupNT = document.createElement('optgroup');
    groupNT.label = '— Nuevo Testamento —';

    booksList.forEach(b => {
      // new Option escapa automáticamente el texto, previniendo XSS en el select
      const option = new Option(b.name, b.id || b.code);
      
      if (b.testament === 'OT') groupOT.appendChild(option);
      else if (b.testament === 'NT') groupNT.appendChild(option);
      else elements.bookSelect.appendChild(option);
    });

    if (groupOT.children.length > 0) elements.bookSelect.appendChild(groupOT);
    if (groupNT.children.length > 0) elements.bookSelect.appendChild(groupNT);

    elements.bookSelect.disabled = false;
  }

  function updateChapters() {
    const selectedBookId = elements.bookSelect.value;

    // (ID-03) Evitar renderizado innecesario si no hay selección válida
    if (!selectedBookId) {
      resetSelect(elements.chapterSelect, 'Selecciona un libro');
      resetSelect(elements.verseSelect, 'Selecciona un capítulo');
      clearPassageDisplay();
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === selectedBookId);
    const totalChapters = book?.chapters || book?.chapterCount || 0;

    if (totalChapters === 0) {
      resetSelect(elements.chapterSelect, 'Sin capítulos');
      resetSelect(elements.verseSelect, 'Sin versículos');
      return;
    }

    const defaultOpt = new Option('-- Capítulo --', '');
    const options = Array.from({ length: totalChapters }, (_, i) => new Option(`Capítulo ${i + 1}`, i + 1));

    elements.chapterSelect.replaceChildren(defaultOpt, ...options);
    elements.chapterSelect.disabled = false;
    resetSelect(elements.verseSelect, 'Selecciona un capítulo');
    
    // Renderizar solo cuando hay una selección válida
    renderPassage(); 
  }

  function updateVerses() {
    const selectedBookId = elements.bookSelect.value;
    const chapterVal = elements.chapterSelect.value;

    if (!selectedBookId || !chapterVal) {
      resetSelect(elements.verseSelect, 'Selecciona un capítulo');
      clearPassageDisplay();
      return;
    }

    const chapterNum = parseInt(chapterVal, 10);
    const chapterIdx = chapterNum - 1;
    const book = booksList.find(b => (b.id || b.code) === selectedBookId);

    if (!book) {
      resetSelect(elements.verseSelect, 'Error de libro');
      return;
    }

    let totalVerses = 0;
    if (Array.isArray(book.verseCounts) && book.verseCounts[chapterIdx] !== undefined) {
      totalVerses = book.verseCounts[chapterIdx];
    } else {
      console.warn(`[Biblia] 'verseCounts' no encontrado para ${book.name} (Cap. ${chapterNum}). Respaldo: ${DEFAULT_VERSE_FALLBACK} versículos.`);
      totalVerses = DEFAULT_VERSE_FALLBACK;
    }

    if (totalVerses <= 0) {
      resetSelect(elements.verseSelect, 'Sin versículos');
      return;
    }

    const defaultOpt = new Option('-- Versículo --', '');
    const options = Array.from({ length: totalVerses }, (_, i) => new Option(`Versículo ${i + 1}`, i + 1));

    elements.verseSelect.replaceChildren(defaultOpt, ...options);
    elements.verseSelect.disabled = false;
    
    renderPassage();
  }

  // ==========================================
  // 4. MUESTRA EN PANTALLA (Salida Inferior)
  // ==========================================
  function clearPassageDisplay() {
    if (elements.passageDisplay) {
      elements.passageDisplay.classList.add('hidden');
      elements.passageDisplay.innerHTML = ''; // Limpiar de forma segura
    }
  }

  function renderPassage() {
    if (!elements.passageDisplay) return;

    const bookId = elements.bookSelect.value;
    const chapter = elements.chapterSelect.value;
    const verse = elements.verseSelect.value;

    if (!bookId) {
      clearPassageDisplay();
      return;
    }

    const book = booksList.find(b => (b.id || b.code) === bookId);
    if (!book) return;

    const testamentName = book.testament === 'OT' 
      ? 'Antiguo Testamento' 
      : (book.testament === 'NT' ? 'Nuevo Testamento' : '');

    let titleText = `${book.name}`;
    if (chapter) titleText += ` ${chapter}`;
    if (verse) titleText += `:${verse}`;

    // (ID-01) REFACTORIZACIÓN CRÍTICA: Construcción segura del DOM sin innerHTML
    elements.passageDisplay.classList.remove('hidden');
    elements.passageDisplay.innerHTML = ''; // Limpiar contenido previo

    const badgeContainer = document.createElement('div');
    badgeContainer.style.marginBottom = '0.5rem';

    if (testamentName) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = testamentName; // textContent previene XSS
      badgeContainer.appendChild(badge);
    }

    if (book.category) {
      const badge = document.createElement('span');
      badge.className = 'badge muted';
      badge.textContent = book.category; // textContent previene XSS
      badgeContainer.appendChild(badge);
    }

    elements.passageDisplay.appendChild(badgeContainer);

    const titleEl = document.createElement('h3');
    titleEl.textContent = titleText; // textContent previene XSS
    elements.passageDisplay.appendChild(titleEl);

    const infoEl = document.createElement('p');
    infoEl.style.color = 'var(--text-muted)';
    infoEl.textContent = 'Pasaje seleccionado correctamente.';
    elements.passageDisplay.appendChild(infoEl);
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
    resetSelect(elements.bookSelect, 'Cargando libros...');
    resetSelect(elements.chapterSelect, 'Selecciona un libro');
    resetSelect(elements.verseSelect, 'Selecciona un capítulo');
  }

  function showError(message, retryFn) {
    if (!elements.statusBanner) return;
    
    elements.statusBanner.className = 'status-banner error';
    // (ID-05) Uso seguro de textContent para el mensaje, solo innerHTML para la estructura estática
    elements.statusBanner.innerHTML = `<span id="errorMessage"></span><button type="button" class="retry-btn" id="retryBtn">Reintentar</button>`;
    
    const errorSpan = elements.statusBanner.querySelector('#errorMessage');
    if (errorSpan) errorSpan.textContent = `⚠️ ${message}`; // Sanitización

    elements.statusBanner.classList.remove('hidden');
    document.getElementById('retryBtn')?.addEventListener('click', retryFn);
  }

  function clearStatus() {
    if (elements.statusBanner) {
      elements.statusBanner.classList.add('hidden');
      elements.statusBanner.innerHTML = '';
    }
  }

  // Escuchadores de eventos (Protegidos por la validación inicial del DOM)
  elements.bookSelect.addEventListener('change', updateChapters);
  elements.chapterSelect.addEventListener('change', updateVerses);
  elements.verseSelect.addEventListener('change', renderPassage);

  // Carga inicial
  loadManifest();
});
