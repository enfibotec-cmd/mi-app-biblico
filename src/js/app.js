document.addEventListener('DOMContentLoaded', async () => {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const verseSelect = document.getElementById('verseSelect');

  let bibleManifest = null;

  // 1. Cargar manifest en memoria
  try {
    const response = await fetch('./data/manifest.json', { cache: 'force-cache' });
    bibleManifest = await response.json();
    populateBooks();
  } catch (error) {
    console.error('Error al cargar el manifest:', error);
  }

  // 2. Llenar select de Libros
  function populateBooks() {
    const options = bibleManifest.books.map(book => {
      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = book.name;
      return opt;
    });

    bookSelect.replaceChildren(...options);
    updateChapters();
  }

  // 3. Llenar select de Capítulos según el Libro seleccionado
  function updateChapters() {
    const selectedBookId = bookSelect.value;
    const book = bibleManifest.books.find(b => b.id === selectedBookId);
    if (!book) return;

    const options = Array.from({ length: book.chapters }, (_, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = `Capítulo ${i + 1}`;
      return opt;
    });

    chapterSelect.replaceChildren(...options);
    updateVerses();
  }

  // 4. Llenar select de Versículos según el Capítulo seleccionado
  function updateVerses() {
    const selectedBookId = bookSelect.value;
    const chapterNum = parseInt(chapterSelect.value, 10);
    const book = bibleManifest.books.find(b => b.id === selectedBookId);

    if (!book || !chapterNum) return;

    const totalVerses = book.verseCounts[chapterNum - 1] || 0;

    const options = Array.from({ length: totalVerses }, (_, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = `Versículo ${i + 1}`;
      return opt;
    });

    verseSelect.replaceChildren(...options);
  }

  // Escuchadores de eventos para actualización encadenada
  bookSelect.addEventListener('change', updateChapters);
  chapterSelect.addEventListener('change', updateVerses);
});
