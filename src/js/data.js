/* Archivo: src/js/data.js */
window.BibleRepository = {
  data: null,
  cache: new Map(),
  
  async init() {
    try {
      if (this.data) return this.data;
      
      // Ruta relativa './' en lugar de absoluta '/' para evitar fallos de despliegue
      const response = await fetch('./data/biblia.json', {
        cache: 'force-cache'
      });
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      
      const json = await response.json();
      
      // Acepta la clave 'books' o asume que la raíz contiene los libros
      const booksData = json.books || json;
      
      if (!booksData || typeof booksData !== 'object' || Array.isArray(booksData)) {
        throw new Error('Estructura de datos inválida en biblia.json');
      }
      
      this.data = booksData;
      return this.data;
    } catch (err) {
      console.error("Error al inicializar BibleRepository:", err);
      this.data = null;
      throw err;
    }
  },
  
  getBooks() {
    if (!this.data) return [];
    
    if (!this.cache.has('books')) {
      this.cache.set('books', Object.keys(this.data));
    }
    return this.cache.get('books');
  },
  
  getChapterCount(bookName) {
    if (!this.data || !bookName) return 0;
    return this.data[bookName]?.chapters || 0;
  },
  
  getVerseCount(bookName, chapter) {
    if (!this.data || !bookName || !chapter) return 30;
    
    const book = this.data[bookName];
    if (!book?.sample) return 30;
    
    const verses = Object.keys(book.sample)
      .filter(key => key.startsWith(`${chapter}-`))
      .length;
    
    return verses > 0 ? verses : 30;
  },
  
  getVerseText(bookName, chapter, verse) {
    if (!this.data || !bookName) return "Libro no encontrado.";
    
    const cacheKey = `${bookName}-${chapter}-${verse}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const book = this.data[bookName];
    if (!book) {
      const msg = "Libro no encontrado.";
      this.cache.set(cacheKey, msg);
      return msg;
    }
    
    const key = `${chapter}-${verse}`;
    const text = book.sample?.[key] || `[Texto no disponible para ${bookName} ${chapter}:${verse}]`;
    
    if (this.cache.size < 1000) {
      this.cache.set(cacheKey, text);
    }
    
    return text;
  },
  
  getRandomVerse() {
    if (!this.data) return null;
    
    const books = this.getBooks();
    if (books.length === 0) return null;
    
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const chapters = this.getChapterCount(randomBook);
    const randomChapter = Math.floor(Math.random() * chapters) + 1;
    const verses = this.getVerseCount(randomBook, randomChapter);
    const randomVerse = Math.floor(Math.random() * verses) + 1;
    
    return {
      book: randomBook,
      chapter: randomChapter,
      verse: randomVerse,
      text: this.getVerseText(randomBook, randomChapter, randomVerse)
    };
  }
};
