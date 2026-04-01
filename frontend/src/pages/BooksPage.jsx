import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import BookList from '../components/Books/BookList';
import './BooksPage.css';
const popularGenres = ['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History'];

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [mode, setMode] = useState('discover');

  const debounceTimerRef = useRef(null);
  const cache = useRef(new Map()).current;

  // Функция поиска в Open Library (уже есть)
  const searchOpenLibrary = useCallback(async (query, genres) => {
    try {
      let searchQuery = query.trim();
      if (searchQuery.length === 0 && genres.length === 0) return [];
      if (searchQuery.length === 0 && genres.length > 0) {
        searchQuery = genres.map(g => `subject:"${g}"`).join(' OR ');
      } else if (genres.length > 0) {
        const subjectQuery = genres.map(g => `subject:"${g}"`).join(' OR ');
        searchQuery = `${searchQuery} AND (${subjectQuery})`;
      }
      if (searchQuery.length < 3) {
        console.warn('Слишком короткий запрос');
        return [];
      }

      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=30`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      return (data.docs || []).map(book => ({
        id: book.key,
        googleId: book.key,
        title: book.title || 'Без названия',
        authorNames: book.author_name || ['Неизвестный автор'],
        coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '',
        genres: book.subject || [],
        first_publish_year: book.first_publish_year,
        source: 'openlibrary',
        status: 'none'
      }));
    } catch (err) {
      console.error('Open Library search error:', err);
      return [];
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    if (mode === 'mybooks') {
      try {
        const res = await api.get('/books');
        // Добавляем source и приводим авторов к формату authorNames
        const booksWithSource = res.data.map(book => ({
          ...book,
          source: 'database',
          authorNames: book.Authors?.map(a => a.name) || ['Неизвестный автор']
        }));
        setBooks(booksWithSource);
      } catch (err) {
        console.error(err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const cacheKey = `${searchTerm}|${selectedGenres.sort().join(',')}`;
    if (cache.has(cacheKey)) {
      setBooks(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    const openLibraryBooks = await searchOpenLibrary(searchTerm, selectedGenres);
    setBooks(openLibraryBooks);
    cache.set(cacheKey, openLibraryBooks);
    setLoading(false);
  }, [mode, searchTerm, selectedGenres, searchOpenLibrary]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(loadBooks, 500);
    return () => clearTimeout(debounceTimerRef.current);
  }, [loadBooks]);

  // --- Обработчики для работы с библиотекой ---
  const handleAddBook = async (book) => {
    try {
      const bookData = {
        title: book.title,
        coverUrl: book.coverUrl,
        publishedYear: book.first_publish_year || null,
        status: 'want_to_read',
        externalId: book.id,  // сохраняем ключ Open Library
        authorNames: book.authorNames
      };
      await api.post('/books', bookData);
      alert('Книга добавлена в библиотеку!');
      // Можно сразу переключиться на "Мою библиотеку" или оставить как есть
      // setMode('mybooks'); // опционально
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Не удалось добавить книгу');
    }
  };

  const handleUpdateStatus = async (bookId, newStatus) => {
    try {
      await api.put(`/books/${bookId}`, { status: newStatus });
      setBooks(prev =>
        prev.map(b => (b.id === bookId ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Удалить книгу из библиотеки?')) return;
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => setSelectedGenres([]);

  return (
    <div className="books-page"> {/* заменён style на className */}
      <h1 className="page-title">📚 Каталог книг</h1>
      
      <div className="mode-switcher">
        <button 
          onClick={() => setMode('discover')}
          className={`mode-button ${mode === 'discover' ? 'active' : ''}`}
        >
          Найти (Open Library)
        </button>
        <button 
          onClick={() => setMode('mybooks')}
          className={`mode-button ${mode === 'mybooks' ? 'active' : ''}`}
        >
          Моя библиотека
        </button>
      </div>

      {mode === 'discover' && (
        <>
          <input
            type="text"
            placeholder="Поиск книг (название, автор)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="filters-section">
            <span className="filters-title">Фильтры по жанрам:</span>
            <div className="genre-checkboxes">
              {popularGenres.map(genre => (
                <label key={genre}>
                  <input 
                    type="checkbox" 
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                  /> {genre}
                </label>
              ))}
              <button className="clear-filters" onClick={clearFilters}>Сбросить</button>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <p className="loading">Загрузка</p>
      ) : books.length === 0 ? (
        <p className="no-books">Книги не найдены</p>
      ) : (
        <BookList
          books={books}
          onAdd={handleAddBook}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteBook}
        />
      )}
    </div>
  );
};

export default BooksPage;