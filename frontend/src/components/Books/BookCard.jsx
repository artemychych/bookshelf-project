const BookCard = ({ book }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '8px' }}>
      {book.coverUrl && <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
      <h3>{book.title}</h3>
      <p>{book.authorNames?.join(', ')}</p>
      <p>Status: {book.status}</p>
    </div>
  );
};

export default BookCard;