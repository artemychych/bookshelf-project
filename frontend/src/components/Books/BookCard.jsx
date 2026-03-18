import React from 'react';
import './BookCard.css'; // добавлен импорт

const BookCard = ({ book, onAdd, onUpdateStatus, onDelete }) => {
  const isFromLibrary = book.source === 'database';

  const handleStatusChange = (e) => {
    onUpdateStatus(book.id, e.target.value);
  };

  return (
    <div className="book-card">
      {book.coverUrl && (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="book-cover"
        />
      )}
      <h3 className="book-title">{book.title}</h3>
      <p className="book-authors">{book.authorNames?.join(', ')}</p>
      <p className="book-status">Статус: {book.status}</p>

      {!isFromLibrary && (
        <button className="add-button" onClick={() => onAdd(book)}>➕ Добавить</button>
      )}

      {isFromLibrary && (
        <>
          <select className="status-select" value={book.status} onChange={handleStatusChange}>
            <option value="want_to_read">Хочу прочитать</option>
            <option value="reading">Читаю</option>
            <option value="read">Прочитано</option>
          </select>
          <button className="delete-button" onClick={() => onDelete(book.id)}>🗑️ Удалить</button>
        </>
      )}
    </div>
  );
};

export default BookCard;