document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');
  const verseDisplay = document.getElementById('verseDisplay');
  const favList = document.getElementById('favList');
  const themeToggle = document.getElementById('themeToggle');

  let currentPassage = { book: '', chapter: 1, verse: 1, text: '' };

  function init() {
    populateBooks();
    loadFavorites();
    setupTheme();
    showCurrentVerse();
  }

  function populateBooks() {
    const books = BibleRepository.getBooks();
    bookSelect.innerHTML = books.map(b => `<option value="${b}">${b}</option>`).join('');
    updateChapters();
  }

  function updateChapters() {
    const count = BibleRepository.getChapterCount(bookSelect.value);
    chapterSelect.innerHTML = Array.from({ length: count }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    updateVerses();
  }

  function updateVerses() {
    verseSelect.innerHTML = Array.from({ length: 30 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  }

  function showCurrentVerse() {
    const book = bookSelect.value;
    const chapter = parseInt(chapterSelect.value, 10) || 1;
    const verse = parseInt(verseSelect.value, 10) || 1;
    const text = BibleRepository.getVerseText(book, chapter, verse);

    currentPassage = { book, chapter, verse, text };

    verseDisplay.innerHTML = `
      <div class="verse-text">"${text}"</div>
      <div class="verse-ref">— ${book} ${chapter}:${verse}</div>
    `;
  }

  function loadFavorites() {
    const favs = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    if (favs.length === 0) {
      favList.innerHTML = '<li class="fav-item" style="justify-content: center; color: var(--text-secondary);">No hay favoritos guardados.</li>';
      return;
    }
    favList.innerHTML = favs.map((item, index) => `
      <li class="fav-item">
        <span><strong>${item.book} ${item.chapter}:${item.verse}</strong> - "${item.text.substring(0, 30)}..."</span>
        <button type="button" data-index="${index}">Eliminar</button>
      </li>
    `).join('');

    favList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        favs.splice(idx, 1);
        localStorage.setItem('bible_favs', JSON.stringify(favs));
        loadFavorites();
      });
    });
  }

  function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  // Eventos de Selectores
  bookSelect.addEventListener('change', () => { updateChapters(); showCurrentVerse(); });
  chapterSelect.addEventListener('change', () => { updateVerses(); showCurrentVerse(); });
  verseSelect.addEventListener('change', showCurrentVerse);

  // Eventos de Botones
  document.getElementById('showBtn').addEventListener('click', showCurrentVerse);

  document.getElementById('randomBtn').addEventListener('click', () => {
    const random = BibleRepository.getRandomPassage();
    bookSelect.value = random.book;
    updateChapters();
    chapterSelect.value = random.chapter;
    updateVerses();
    verseSelect.value = random.verse;
    showCurrentVerse();
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    const textToCopy = `"${currentPassage.text}" - ${currentPassage.book} ${currentPassage.chapter}:${currentPassage.verse}`;
    navigator.clipboard.writeText(textToCopy);
    const btn = document.getElementById('copyBtn');
    const prevText = btn.textContent;
    btn.textContent = '¡Copiado!';
    setTimeout(() => btn.textContent = prevText, 1500);
  });

  document.getElementById('favBtn').addEventListener('click', () => {
    const favs = JSON.parse(localStorage.getItem('bible_favs') || '[]');
    const exists = favs.some(f => f.book === currentPassage.book && f.chapter === currentPassage.chapter && f.verse === currentPassage.verse);
    if (!exists) {
      favs.push(currentPassage);
      localStorage.setItem('bible_favs', JSON.stringify(favs));
      loadFavorites();
    }
  });

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  init();
});
