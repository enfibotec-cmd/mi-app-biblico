/**
 * Utilidades de UI y Persistencia
 */
const StorageUtil = {
  getTheme() {
    return localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('bible_favorites')) || [];
    } catch {
      return [];
    }
  },

  saveFavorite(item) {
    const favorites = this.getFavorites();
    const exists = favorites.some(
      f => f.book === item.book && f.chapter === item.chapter && f.verse === item.verse
    );
    
    if (!exists) {
      favorites.push(item);
      localStorage.setItem('bible_favorites', JSON.stringify(favorites));
      return true;
    }
    return false;
  },

  removeFavorite(index) {
    const favorites = this.getFavorites();
    favorites.splice(index, 1);
    localStorage.setItem('bible_favorites', JSON.stringify(favorites));
  }
};

const ClipboardUtil = {
  async copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
};
