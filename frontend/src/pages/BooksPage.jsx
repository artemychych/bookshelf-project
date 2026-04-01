import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

  // Filters for "Моя библиотека"
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGenresMyBooks, setSelectedGenresMyBooks] = useState([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Filters for "Найти (Open Library)"
  const [yearFromDiscover, setYearFromDiscover] = useState('');
  const [yearToDiscover, setYearToDiscover] = useState('');

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

  useEffect(() => {
    if (mode === 'mybooks') {
      setStatusFilter('all');
      setSelectedGenresMyBooks([]);
      setYearFrom('');
      setYearTo('');
    }
  }, [mode]);

  const filteredMyBooks = useMemo(() => {
    if (mode !== 'mybooks') return [];
    return books.filter(book => {
      if (statusFilter !== 'all' && book.status !== statusFilter) return false;
      if (selectedGenresMyBooks.length > 0) {
        const bookGenres = book.genres || [];
        if (!selectedGenresMyBooks.some(g => bookGenres.includes(g))) return false;
      }
      const year = book.publishedYear;
      if (yearFrom && year < Number(yearFrom)) return false;
      if (yearTo && year > Number(yearTo)) return false;
      return true;
    });
  }, [books, mode, statusFilter, selectedGenresMyBooks, yearFrom, yearTo]);

  const filteredDiscoverBooks = useMemo(() => {
    if (mode !== 'discover') return [];
    return books.filter(book => {
      const year = book.first_publish_year;
      if (yearFromDiscover && year < Number(yearFromDiscover)) return false;
      if (yearToDiscover && year > Number(yearToDiscover)) return false;
      return true;
    });
  }, [books, mode, yearFromDiscover, yearToDiscover]);

  const handleAddBook = async (book) => {
    try {
      const bookData = {
        title: book.title,
        coverUrl: book.coverUrl,
        publishedYear: book.first_publish_year || null,
        status: 'want_to_read',
        externalId: book.id,
        authorNames: book.authorNames
      };
      await api.post('/books', bookData);
      alert('Книга добавлена в библиотеку!');
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

  const clearDiscoverFilters = () => {
    setSelectedGenres([]);
    setYearFromDiscover('');
    setYearToDiscover('');
  };

  const toggleGenreMyBooks = (genre) => {
    setSelectedGenresMyBooks(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const clearMyBooksFilters = () => {
    setStatusFilter('all');
    setSelectedGenresMyBooks([]);
    setYearFrom('');
    setYearTo('');
  };

  return (
    <div className="books-page">
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
            <div style={{ marginBottom: '1rem' }}>
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
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span className="filters-title">Год:</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={yearFromDiscover}
                  onChange={(e) => setYearFromDiscover(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                    width: '100px',
                    fontSize: '0.9rem'
                  }}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="До"
                  value={yearToDiscover}
                  onChange={(e) => setYearToDiscover(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                    width: '100px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <button className="clear-filters" onClick={clearDiscoverFilters}>Сбросить</button>
            </div>
          </div>
        </>
      )}

      {mode === 'mybooks' && (
        <div className="filters-section">
          <div style={{ marginBottom: '1rem' }}>
            <span className="filters-title">Статус:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                marginLeft: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid #ddd',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">Все</option>
              <option value="read">Прочитано</option>
              <option value="reading">Читаю</option>
              <option value="want_to_read">Хочу прочитать</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span className="filters-title">Фильтры по жанрам:</span>
            <div className="genre-checkboxes" style={{ marginTop: '0.5rem' }}>
              {popularGenres.map(genre => (
                <label key={genre}>
                  <input
                    type="checkbox"
                    checked={selectedGenresMyBooks.includes(genre)}
                    onChange={() => toggleGenreMyBooks(genre)}
                  /> {genre}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span className="filters-title">Год:</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="number"
                placeholder="От"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  width: '100px',
                  fontSize: '0.9rem'
                }}
              />
              <span>–</span>
              <input
                type="number"
                placeholder="До"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  width: '100px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <button className="clear-filters" onClick={clearMyBooksFilters}>Сбросить</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="loading">Загрузка</p>
      ) : mode === 'mybooks' && filteredMyBooks.length === 0 ? (
        <p className="no-books">Книги не найдены</p>
      ) : mode === 'discover' && filteredDiscoverBooks.length === 0 ? (
        <p className="no-books">Книги не найдены</p>
      ) : (
        <BookList
          books={mode === 'mybooks' ? filteredMyBooks : filteredDiscoverBooks}
          onAdd={handleAddBook}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteBook}
        />
      )}
    </div>
  );
};

export default BooksPage;