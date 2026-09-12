/* Archivo: src/js/app.js */
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const verseDisplay = document.getElementById('verseDisplay');
  const favList = document.getElementById('favList');
  const themeToggle = document.getElementById('themeToggle');
  const randomBtn = document.getElementById('randomBtn');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  
  let currentPassage = { book: '', chapter: 1, verse: 1, text: '' };
  const MAX_FAVORITES = 50; // Límite de favoritos
  
  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Inicialización asíncrona
  async function init() {
    try {
      // Mostrar loading
      if (verseDisplay) {
        verseDisplay.innerHTML = '<p class="loading">Cargando Biblia...</p>';
      }
      
      // 1. Cargar el JSON primero
      await BibleRepository.init();
      
      // 2. Configurar la UI y los eventos
      populateBooks();
      loadFavorites();
      setupTheme();
      setupEventListeners();
      
      // 3. Mostrar versículo inicial
      showCurrentVerse();
      
    } catch (error) {
      console.error('Error en inicialización:', error);
      if (verseDisplay) {
        verseDisplay.innerHTML = `
          <div class="error-card">
            <p class="error-msg">⚠️ Error al cargar la Biblia</p>
            <p class="error-detail">Verifica que el archivo biblia.json esté en data/</p>
            <button onclick="location.reload()" class="retry-btn">Reintentar</button>
          </div>
        `;
      }
    }
  }
  
  function populateBooks() {
    const books = BibleRepository.getBooks();
    if (!books || books.length === 0) {
      console.warn('No se encontraron libros');
      return;
    }
    
    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    books.forEach(book => {
      const option = document.createElement('option');
      option.value = book;
      option.textContent = book;
      fragment.appendChild(option);
    });
    
    bookSelect.innerHTML = '';
    bookSelect.appendChild(fragment);
    updateChapters();
  }
  
  function updateChapters() {
    const book = bookSelect.value;
    const count = BibleRepository.getChapterCount(book);
    
    if (count === 0) {
      chapterSelect.innerHTML = '<option value="1">1</option>';
      updateVerses();
      return;
    }
    
    // Usar DocumentFragment
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= count; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      fragment.appendChild(option);
    }
    
    chapterSelect.innerHTML = '';
    chapterSelect.appendChild(fragment);
    updateVerses();
  }
  
  function updateVerses() {
    const book = bookSelect.value;
    const chapter = parseInt(chapterSelect.value, 10) || 1;
    const verseCount = BibleRepository.getVerseCount(book, chapter);
    
    // Usar DocumentFragment
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= verseCount; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      fragment.appendChild(option);
    }
    
    verseSelect.innerHTML = '';
    verseSelect.appendChild(fragment);
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
    // Debounced handlers para mejor rendimiento
    const debouncedUpdateChapters = debounce(updateChapters, 100);
    const debouncedUpdateVerses = debounce(updateVerses, 100);
    const debouncedShowVerse = debounce(showCurrentVerse, 100);
    
    // Reacción en cadena al cambiar cualquier selector
    bookSelect?.addEventListener('change', debouncedUpdateChapters);
    chapterSelect?.addEventListener('change', debouncedUpdateVerses);
    verseSelect?.addEventListener('change', debouncedShowVerse);
    
    // Cambio de tema
    themeToggle?.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Botón aleatorio
    randomBtn?.addEventListener('click', () => {
      const random = BibleRepository.getRandomVerse();
      if (random) {
        bookSelect.value = random.book;
        updateChapters();
        chapterSelect.value = random.chapter;
        updateVerses();
        verseSelect.value = random.verse;
        showCurrentVerse();
      }
    });
    
    // Botón copiar
    copyBtn?.addEventListener('click', () => {
      const textToCopy = `${currentPassage.book} ${currentPassage.chapter}:${currentPassage.verse} - "${currentPassage.text}"`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = '✓ Copiado';
        setTimeout(() => copyBtn.textContent = '📋 Copiar', 2000);
      }).catch(err => {
        console.error('Error al copiar:', err);
      });
    });
    
    // Botón guardar favorito
    saveBtn?.addEventListener('click', () => {
      saveFavorite(currentPassage);
    });
  }
  
  function saveFavorite(passage) {
    const favorites = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    
    // Verificar si ya existe
    const exists = favorites.some(f => 
      f.book === passage.book && 
      f.chapter === passage.chapter && 
      f.verse === passage.verse
    );
    
    if (exists) {
      alert('Este pasaje ya está en favoritos');
      return;
    }
    
    // Limitar cantidad de favoritos
    if (favorites.length >= MAX_FAVORITES) {
      alert(`Máximo ${MAX_FAVORITES} favoritos permitidos`);
      return;
    }
    
    favorites.unshift(passage);
    localStorage.setItem('bible_favs', JSON.stringify(favorites));
    loadFavorites();
  }
  
  function loadFavorites() {
    if (!favList) return;
    
    const favorites = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    
    if (favorites.length === 0) {
      favList.innerHTML = '<li class="empty">No hay pasajes favoritos</li>';
      return;
    }
    
    // Usar DocumentFragment
    const fragment = document.createDocumentFragment();
    favorites.forEach((f, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${f.book} ${f.chapter}:${f.verse}</strong> - ${f.text.substring(0, 40)}...
        <button class="remove-fav" data-index="${index}" title="Eliminar">×</button>
      `;
      fragment.appendChild(li);
    });
    
    favList.innerHTML = '';
    favList.appendChild(fragment);
    
    // Event delegation para botones de eliminar
    favList.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-fav')) {
        const index = parseInt(e.target.dataset.index, 10);
        removeFavorite(index);
      }
    });
  }
  
  function removeFavorite(index) {
    const favorites = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    favorites.splice(index, 1);
    localStorage.setItem('bible_favs', JSON.stringify(favorites));
    loadFavorites();
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
