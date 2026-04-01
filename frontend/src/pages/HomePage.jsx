import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="hero">
        <h1>📚 Добро пожаловать в BookShelf!</h1>
        <p>Ищи книги, добавляй в библиотеку и отслеживай статусы.</p>
        <button className="btn-primary" onClick={() => window.location.href = '/books'}>
          Начать поиск
        </button>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Поиск книг</h3>
          <p>Находи любые книги — по названию, автору или жанру.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📖</div>
          <h3>Личная библиотека</h3>
          <p>Добавляй книги в свой список и храни их в одном месте.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📌</div>
          <h3>Отслеживание статуса</h3>
          <p>Отмечай, какие книги уже прочитаны, а какие ещё ждут своей очереди.</p>
        </div>
      </div>

      <div className="cta">
        <h2>Готов пополнить свою книжную полку?</h2>
        <button className="btn-secondary" onClick={() => window.location.href = '/books'}>
          Перейти к поиску
        </button>
      </div>
    </div>
  );
};

export default HomePage;