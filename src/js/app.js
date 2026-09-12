/* src/js/app.js */
document.addEventListener('DOMContentLoaded', async () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');

  let booksList = [];

  // Petición al Manifest (Fuente única de verdad)
  try {
    const res = await fetch('./data/manifest.json');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    
    booksList = Array.isArray(data.books) ? data.books : Object.values(data.books);
    initSelectors();
  } catch (err) {
    console.error('Error al inicializar los datos:', err);
  }

  function initSelectors() {
    populateBooks();
    bookSelect.addEventListener('change', populateChapters);
    chapterSelect.addEventListener('change', populateVerses);
  }

  function populateBooks() {
    const options = booksList.map(b => new Option(b.name, b.id || b.code));
    bookSelect.replaceChildren(...options);
    populateChapters();
  }

  function populateChapters() {
    const book = booksList.find(b => (b.id || b.code) === bookSelect.value);
    if (!book) return;

    const count = book.chapters || book.chapterCount || 0;
    const options = Array.from({ length: count }, (_, i) => new Option(`Capítulo ${i + 1}`, i + 1));
    
    chapterSelect.replaceChildren(...options);
    populateVerses();
  }

  function populateVerses() {
    const book = booksList.find(b => (b.id || b.code) === bookSelect.value);
    const chapterIdx = parseInt(chapterSelect.value, 10) - 1;
    
    if (!book || chapterIdx < 0) return;

    const count = book.verseCounts ? book.verseCounts[chapterIdx] : 0;
    const options = Array.from({ length: count }, (_, i) => new Option(`Versículo ${i + 1}`, i + 1));
    
    verseSelect.replaceChildren(...options);
  }
});
