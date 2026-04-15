import React from 'react';
import BookCard from './BookCard';
import './BookList.css'; // добавлен импорт

const BookList = ({ books, onAdd, onUpdateStatus, onDelete, onFetchReviews,
  onFetchMyReview,
  onSubmitReview,
  onDeleteReview }) => {
  return (
    <div className="books-grid">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          onAdd={onAdd}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onFetchReviews={onFetchReviews}
          onFetchMyReview={onFetchMyReview}
          onSubmitReview={onSubmitReview}
          onDeleteReview={onDeleteReview}
        />
      ))}
    </div>
  );
};

export default BookList;