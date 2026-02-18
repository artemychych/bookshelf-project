import BookCard from './BookCard';

const BookList = ({ books }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookList;