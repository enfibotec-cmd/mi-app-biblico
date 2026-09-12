/* Archivo: src/js/data.js */
window.BibleRepository = {
  data: null,
  cache: new Map(), // Caché para consultas frecuentes
  
  async init() {
    try {
      // Verificar si ya está cargado
      if (this.data) return this.data;
      
      const response = await fetch('/data/biblia.json', {
        cache: 'force-cache' // Forzar caché del navegador
      });
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const json = await response.json();
      
      // Validar estructura
      if (!json.books || typeof json.books !== 'object') {
        throw new Error('Estructura de datos inválida');
      }
      
      this.data = json.books;
      return this.data;
    } catch (err) {
      console.error("Error al cargar biblia.json:", err);
      throw err;
    }
  },
  
  getBooks() {
    if (!this.data) return [];
    
    // Cachear resultado
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
    if (!this.data || !bookName || !chapter) return 30; // Default
    
    const book = this.data[bookName];
    if (!book?.sample) return 30;
    
    // Contar versículos disponibles en el sample
    const verses = Object.keys(book.sample)
      .filter(key => key.startsWith(`${chapter}-`))
      .length;
    
    return verses > 0 ? verses : 30;
  },
  
  getVerseText(bookName, chapter, verse) {
    if (!this.data || !bookName) return "Libro no encontrado.";
    
    const cacheKey = `${bookName}-${chapter}-${verse}`;
    
    // Verificar caché
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
    
    // Guardar en caché (limitar tamaño)
    if (this.cache.size < 1000) {
      this.cache.set(cacheKey, text);
    }
    
    return text;
  },
  
  getRandomVerse() {
    if (!this.data) return null;
    
    const books = this.getBooks();
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
