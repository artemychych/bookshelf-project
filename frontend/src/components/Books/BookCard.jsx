import React, { useState } from 'react';
import './BookCard.css';

const BookCard = ({ book, onAdd, onUpdateStatus, onDelete }) => {
  const isFromLibrary = book.source === 'database';
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isReadReviewsModalOpen, setIsReadReviewsModalOpen] = useState(false);

  // Фиктивные данные для демонстрации рецензий
  const fakeReviews = [
    {
      id: 1,
      user: "Анна К.",
      rating: 5,
      text: "Потрясающая книга! Сюжет держит в напряжении до последней страницы. Очень рекомендую.",
      date: "2 дня назад"
    },
    {
      id: 2,
      user: "Михаил",
      rating: 4,
      text: "Хорошее произведение, но концовка показалась немного скомканной. В целом – достойно.",
      date: "неделю назад"
    },
    {
      id: 3,
      user: "Елена В.",
      rating: 5,
      text: "Перечитала уже второй раз. Глубокие персонажи, прекрасный язык. Одна из любимых книг.",
      date: "месяц назад"
    }
  ];

  const handleStatusChange = (e) => {
    onUpdateStatus(book.id, e.target.value);
  };

  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setRating(0);
    setReviewText('');
  };

  const openReadReviewsModal = () => setIsReadReviewsModalOpen(true);
  const closeReadReviewsModal = () => setIsReadReviewsModalOpen(false);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    console.log('Рецензия отправлена (заглушка):', { rating, text: reviewText });
    closeReviewModal();
  };

  // Компонент для отображения звёзд в рецензиях (только для чтения)
  const StarRating = ({ value }) => (
    <div className="stars-readonly">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star-readonly ${star <= value ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <>
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
          <div className="external-actions">
            <button className="add-button" onClick={() => onAdd(book)}>
              ➕ Добавить
            </button>
            <button className="read-reviews-button" onClick={openReadReviewsModal}>
              💬 Рецензии
            </button>
          </div>
        )}

        {isFromLibrary && (
          <>
            <select
              className="status-select"
              value={book.status}
              onChange={handleStatusChange}
            >
              <option value="want_to_read">Хочу прочитать</option>
              <option value="reading">Читаю</option>
              <option value="read">Прочитано</option>
            </select>
            <button className="review-button" onClick={openReviewModal}>
              ✏️ Написать рецензию/Редактировать
            </button>
            <button className="delete-button" onClick={() => onDelete(book.id)}>
              🗑️ Удалить
            </button>
          </>
        )}
      </div>

      {/* Модальное окно "Написать рецензию" (уже было) */}
      {isReviewModalOpen && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReviewModal}>&times;</button>
            <h2 className="modal-title">Написать рецензию</h2>
            <p className="modal-book-title">{book.title}</p>
            <form onSubmit={handleSubmitReview}>
              <div className="rating-container">
                <span className="rating-label">Ваша оценка:</span>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                className="review-textarea"
                placeholder="Поделитесь впечатлениями о книге..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="5"
              />
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeReviewModal}>
                  Отмена
                </button>
                <button type="submit" className="submit-button">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно "Рецензии читателей" */}
      {isReadReviewsModalOpen && (
        <div className="modal-overlay" onClick={closeReadReviewsModal}>
          <div className="modal-content reviews-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReadReviewsModal}>&times;</button>
            <h2 className="modal-title">Рецензии</h2>
            <p className="modal-book-title">{book.title}</p>
            <div className="reviews-list">
              {fakeReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-user">{review.user}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <StarRating value={review.rating} />
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={closeReadReviewsModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookCard;