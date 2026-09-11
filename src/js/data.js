/**
 * Módulo de manejo de datos bíblicos.
 */
const BibleRepository = {
  data: null,

  async init() {
    try {
      const response = await fetch('data/biblia.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      this.data = json.books;
      return this.data;
    } catch (error) {
      console.error('Error al cargar biblia.json:', error);
      throw error;
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
    if (!book) return null;

    const key = `${chapter}-${verse}`;
    if (book.sample && book.sample[key]) {
      return book.sample[key];
    }
    
    return `[Texto de muestra no disponible para ${bookName} ${chapter}:${verse}]`;
  },

  getRandomPassage() {
    const books = this.getBooks();
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const maxChapters = this.getChapterCount(randomBook);
    const randomChapter = Math.floor(Math.random() * maxChapters) + 1;
    
    // Buscar si hay muestra específica en el objeto o seleccionar versículo 1
    const samples = Object.keys(this.data[randomBook].sample || {});
    let randomVerse = 1;
    
    if (samples.length > 0) {
      const randomSampleKey = samples[Math.floor(Math.random() * samples.length)];
      const [ch, v] = randomSampleKey.split('-');
      return { book: randomBook, chapter: parseInt(ch, 10), verse: parseInt(v, 10) };
    }

    return { book: randomBook, chapter: randomChapter, verse: randomVerse };
  }
};
