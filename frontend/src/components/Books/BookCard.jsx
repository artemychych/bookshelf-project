import React, { useState, useEffect } from 'react';
import './BookCard.css';

const BookCard = ({
  book,
  onAdd,
  onUpdateStatus,
  onDelete,
  onFetchReviews,
  onFetchMyReview,
  onSubmitReview,
  onDeleteReview
}) => {
  const isFromLibrary = book.source === 'database';
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isReadReviewsModalOpen, setIsReadReviewsModalOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingMyReview, setLoadingMyReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка рецензий при открытии модалки "Рецензии читателей"
  useEffect(() => {
    if (isReadReviewsModalOpen && onFetchReviews) {
      setLoadingReviews(true);
      onFetchReviews(book.id)
        .then(data => setReviews(data))
        .catch(err => setError('Не удалось загрузить рецензии' + err))
        .finally(() => setLoadingReviews(false));
    }
  }, [isReadReviewsModalOpen, book.id, onFetchReviews]);

  // Загрузка своей рецензии при открытии окна написания/редактирования
  useEffect(() => {
    if (isReviewModalOpen && isFromLibrary && onFetchMyReview) {
      setLoadingMyReview(true);
      onFetchMyReview(book.id)
        .then(review => {
          setMyReview(review);
          if (review) {
            setRating(review.rating);
            setReviewText(review.content);
          } else {
            setRating(0);
            setReviewText('');
          }
        })
        .catch(err => setError('Не удалось загрузить вашу рецензию' + err))
        .finally(() => setLoadingMyReview(false));
    }
  }, [isReviewModalOpen, book.id, isFromLibrary, onFetchMyReview]);

  const handleStatusChange = (e) => {
    onUpdateStatus(book.id, e.target.value);
  };

  const openReviewModal = () => {
    setError(null);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setRating(0);
    setReviewText('');
    setMyReview(null);
    setError(null);
  };

  // const openReadReviewsModal = () => {
  //   setError(null);
  //   setIsReadReviewsModalOpen(true);
  // };

  const closeReadReviewsModal = () => {
    setIsReadReviewsModalOpen(false);
    setError(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!onSubmitReview) return;

    setSubmittingReview(true);
    setError(null);
    try {
      await onSubmitReview(
        book.id,
        rating,
        reviewText,
        myReview?.id
      );
      closeReviewModal();
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении рецензии');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteMyReview = async () => {
    if (!myReview || !onDeleteReview) return;
    if (!window.confirm('Удалить вашу рецензию?')) return;

    setSubmittingReview(true);
    setError(null);
    try {
      await onDeleteReview(book.id, myReview.id);
      setMyReview(null);
      closeReviewModal();
    } catch (err) {
      setError(err.message || 'Ошибка при удалении рецензии');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
    return date.toLocaleDateString('ru-RU');
  };

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
            {/* <button className="read-reviews-button" onClick={openReadReviewsModal}>
              💬 Рецензии
            </button> */}
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
              ✏️ {myReview ? 'Редактировать рецензию' : 'Написать рецензию'}
            </button>
            <button className="delete-button" onClick={() => onDelete(book.id)}>
              🗑️ Удалить
            </button>
          </>
        )}
      </div>

      {/* Модальное окно написания/редактирования рецензии */}
      {isReviewModalOpen && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReviewModal}>&times;</button>
            <h2 className="modal-title">
              {myReview ? 'Редактировать рецензию' : 'Написать рецензию'}
            </h2>
            <p className="modal-book-title">{book.title}</p>

            {loadingMyReview ? (
              <div className="loading">Загрузка...</div>
            ) : (
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
                  required
                />
                {error && <div className="error-message">{error}</div>}
                <div className="modal-actions">
                  {myReview && (
                    <button
                      type="button"
                      className="delete-review-button"
                      onClick={handleDeleteMyReview}
                      disabled={submittingReview}
                    >
                      🗑️ Удалить
                    </button>
                  )}
                  <button type="button" className="cancel-button" onClick={closeReviewModal}>
                    Отмена
                  </button>
                  <button type="submit" className="submit-button" disabled={submittingReview}>
                    {submittingReview ? 'Сохранение...' : 'Отправить'}
                  </button>
                </div>
              </form>
            )}
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

            {loadingReviews ? (
              <div className="loading">Загрузка рецензий...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">Пока нет рецензий. Будьте первым!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-user">{review.User?.name || 'Пользователь'}</span>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating value={review.rating} />
                    <p className="review-text">{review.content}</p>
                  </div>
                ))}
              </div>
            )}

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