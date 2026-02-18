import { useEffect, useState } from 'react';
import api from '../services/api';
import BookList from '../components/Books/BookList';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/books')
      .then(response => {
        setBooks(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Books</h1>
      <BookList books={books} />
    </div>
  );
};

export default BooksPage;