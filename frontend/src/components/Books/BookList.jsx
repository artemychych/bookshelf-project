import React from 'react';
import BookCard from './BookCard';
import './BookList.css'; // добавлен импорт

const BookList = ({ books, onAdd, onUpdateStatus, onDelete }) => {
  return (
    <div className="books-grid">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          onAdd={onAdd}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BookList;