import { useEffect, useState } from 'react';
import api from '../services/api';
import BookList from '../components/Books/BookList';

const popularGenres = ['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History'];

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [mode, setMode] = useState('discover'); // 'discover' или 'mybooks'

  // Поиск через Google Books API (встроено прямо сюда)
  const searchGoogleBooks = async (query) => {
    try {
      let searchQuery = query.trim() || 'bestsellers';
      let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=30&printType=books`;
      
      if (selectedGenres.length > 0) {
        url += selectedGenres.map(g => `+subject:${g}`).join('');
      }

      const res = await fetch(url);
      const data = await res.json();
      
      return (data.items || []).map(book => ({
        id: book.id,
        googleId: book.id,
        title: book.volumeInfo.title || 'Без названия',
        authorNames: book.volumeInfo.authors || ['Неизвестный автор'],
        coverUrl: book.volumeInfo.imageLinks?.thumbnail 
          ? book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://') 
          : '',
        genres: book.volumeInfo.categories || [],
        source: 'google',
        status: 'none'
      }));
    } catch (err) {
      console.error('Google Books error:', err);
      return [];
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      
      if (mode === 'mybooks') {
        try {
          const res = await api.get('/books');
          setBooks(res.data || []);
        } catch (err) {
          console.error(err);
          setBooks([]);
        }
      } else {
        const googleBooks = await searchGoogleBooks(searchTerm);
        setBooks(googleBooks);
      }
      
      setLoading(false);
    };

    loadBooks();
  }, [mode, searchTerm, selectedGenres]);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const clearFilters = () => setSelectedGenres([]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📚 Каталог книг</h1>

      {/* Переключатель режимов */}
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setMode('discover')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            fontWeight: mode === 'discover' ? 'bold' : 'normal',
            backgroundColor: mode === 'discover' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Discover (Google Books)
        </button>
        <button 
          onClick={() => setMode('mybooks')}
          style={{ 
            padding: '10px 20px',
            fontWeight: mode === 'mybooks' ? 'bold' : 'normal',
            backgroundColor: mode === 'mybooks' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
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
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '16px', 
              marginBottom: '15px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />

          <div style={{ marginBottom: '20px' }}>
            <strong>Фильтры по жанрам:</strong><br />
            {popularGenres.map(genre => (
              <label key={genre} style={{ marginRight: '15px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                /> {genre}
              </label>
            ))}
            <button onClick={clearFilters} style={{ marginLeft: '10px', fontSize: '0.9em' }}>
              Сбросить фильтры
            </button>
          </div>
        </>
      )}

      {loading ? (
        <p>Загрузка книг...</p>
      ) : books.length === 0 ? (
        <p>Книги не найдены</p>
      ) : (
        <BookList books={books} />
      )}
    </div>
  );
};

export default BooksPage;