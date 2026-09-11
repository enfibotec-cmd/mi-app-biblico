/* Archivo: scr/js/data.js (Opción Asíncrona con fetch) */
window.BibleRepository = {
  data: null,

  async init() {
    try {
      const response = await fetch('../../data/biblia.json');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const json = await response.json();
      this.data = json.books;
      return this.data;
    } catch (err) {
      console.error("Error al cargar biblia.json:", err);
      alert("Para usar biblia.json de forma externa debes ejecutar un servidor local (ej. Live Server o 'python -m http.server').");
      throw err;
    }
  },

  getBooks() {
    return Object.keys(this.data || {});
  },
  getChapterCount(bookName) {
    return this.data?.[bookName]?.chapters || 0;
  },
  getVerseText(bookName, chapter, verse) {
    const book = this.data?.[bookName];
    if (!book) return "Libro no encontrado.";
    const key = `${chapter}-${verse}`;
    return book.sample?.[key] || `[Texto de muestra no disponible para ${bookName} ${chapter}:${verse}]`;
  }
};
