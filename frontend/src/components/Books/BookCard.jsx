import { useState } from 'react';
import api from '../../services/api';

const BookCard = ({ book }) => {
  const [adding, setAdding] = useState(false);

  const handleAddToLibrary = async () => {
    const statusOptions = {
      '1': 'want_to_read',
      '2': 'reading',
      '3': 'read'
    };

    const choice = prompt(
      'Выберите статус:\n' +
      '1 — Хочу прочитать\n' +
      '2 — Читаю сейчас\n' +
      '3 — Прочитано'
    );

    const status = statusOptions[choice];
    if (!status) return;

    setAdding(true);
    try {
      await api.post('/books', {
        googleId: book.googleId || book.id,
        title: book.title,
        authorNames: book.authorNames,
        coverUrl: book.coverUrl,
        status
      });
      alert(`✅ "${book.title}" добавлена со статусом ${status}`);
    } catch (err) {
      alert('Ошибка добавления');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '12px', 
      borderRadius: '8px',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {book.coverUrl && (
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '4px' }} 
        />
      )}
      
      <h3 style={{ margin: '12px 0 6px' }}>{book.title}</h3>
      <p>{book.authorNames?.join(', ')}</p>
      
      {book.genres && book.genres.length > 0 && (
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          {book.genres.slice(0, 2).join(', ')}
        </p>
      )}

      <p><strong>Статус:</strong> {book.status === 'none' || !book.status ? 'Не добавлена' : book.status}</p>

      {book.source === 'google' && (
        <button 
          onClick={handleAddToLibrary}
          disabled={adding}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {adding ? 'Добавляется...' : 'Добавить в библиотеку'}
        </button>
      )}
    </div>
  );
};

export default BookCard;