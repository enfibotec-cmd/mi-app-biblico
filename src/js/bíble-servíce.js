/* src/js/BibleService.js */
window.BibleService = {
  manifest: null,
  loadedBooks: new Map(),

  // Carga inicial (Solo descarga ~12 KB en <50ms)
  async init() {
    if (this.manifest) return;
    const res = await fetch('./data/manifest.json', { cache: 'force-cache' });
    this.manifest = await res.json();
  },

  // Puebla el desplegable de capítulos instantáneamente desde memoria
  getChapterCount(bookKey) {
    return this.manifest?.books[bookKey]?.chapters || 0;
  },

  // Descarga el texto del libro bajo demanda (Lazy Load)
  async getBookText(bookKey) {
    if (this.loadedBooks.has(bookKey)) {
      return this.loadedBooks.get(bookKey);
    }

    const res = await fetch(`./data/books/${bookKey}.json`, { cache: 'force-cache' });
    const bookData = await res.json();
    
    this.loadedBooks.set(bookKey, bookData);
    return bookData;
  }
};
