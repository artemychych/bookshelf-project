// StatisticsPage.jsx
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './StatisticsPage.css';

// Регистрация компонентов Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

// 🧪 Фиктивные данные книг (замена API)
const MOCK_BOOKS = [
  {
    id: 1,
    title: 'Война и мир',
    authorNames: ['Лев Толстой'],
    genres: ['Роман', 'Историческая проза', 'Классика'],
    publishedYear: 1869,
    status: 'read',
  },
  {
    id: 2,
    title: 'Преступление и наказание',
    authorNames: ['Фёдор Достоевский'],
    genres: ['Роман', 'Психологическая проза', 'Классика'],
    publishedYear: 1866,
    status: 'read',
  },
  {
    id: 3,
    title: 'Мастер и Маргарита',
    authorNames: ['Михаил Булгаков'],
    genres: ['Роман', 'Фантастика', 'Сатира'],
    publishedYear: 1967,
    status: 'reading',
  },
  {
    id: 4,
    title: '1984',
    authorNames: ['Джордж Оруэлл'],
    genres: ['Антиутопия', 'Научная фантастика'],
    publishedYear: 1949,
    status: 'read',
  },
  {
    id: 5,
    title: 'Сто лет одиночества',
    authorNames: ['Габриэль Гарсиа Маркес'],
    genres: ['Магический реализм', 'Роман'],
    publishedYear: 1967,
    status: 'want_to_read',
  },
  {
    id: 6,
    title: 'Убить пересмешника',
    authorNames: ['Харпер Ли'],
    genres: ['Роман', 'Драма'],
    publishedYear: 1960,
    status: 'read',
  },
  {
    id: 7,
    title: 'Великий Гэтсби',
    authorNames: ['Фрэнсис Скотт Фицджеральд'],
    genres: ['Роман', 'Драма'],
    publishedYear: 1925,
    status: 'reading',
  },
  {
    id: 8,
    title: 'Три товарища',
    authorNames: ['Эрих Мария Ремарк'],
    genres: ['Роман', 'Военная проза'],
    publishedYear: 1936,
    status: 'want_to_read',
  },
  {
    id: 9,
    title: 'Над пропастью во ржи',
    authorNames: ['Джером Д. Сэлинджер'],
    genres: ['Роман', 'Психологическая проза'],
    publishedYear: 1951,
    status: 'read',
  },
  {
    id: 10,
    title: 'Анна Каренина',
    authorNames: ['Лев Толстой'],
    genres: ['Роман', 'Классика'],
    publishedYear: 1877,
    status: 'read',
  },
];

const StatisticsPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных (можно убрать setTimeout для мгновенной отрисовки)
    const timer = setTimeout(() => {
      setBooks(MOCK_BOOKS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="statistics-loading">Загрузка статистики...</div>;
  }

  if (books.length === 0) {
    return (
      <div className="statistics-empty">
        <h2>📊 Моя статистика</h2>
        <p>В вашей библиотеке пока нет книг. Добавьте книги, чтобы увидеть статистику.</p>
      </div>
    );
  }

  // ========== Подготовка данных для графиков ==========

  // 1. Распределение по статусам
  const statusCounts = {
    read: 0,
    reading: 0,
    want_to_read: 0,
  };
  books.forEach(book => {
    if (book.status && statusCounts.hasOwnProperty(book.status)) {
      statusCounts[book.status]++;
    }
  });

  const statusData = {
    labels: ['Прочитано', 'Читаю', 'Хочу прочитать'],
    datasets: [
      {
        label: 'Количество книг',
        data: [statusCounts.read, statusCounts.reading, statusCounts.want_to_read],
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
        borderWidth: 0,
      },
    ],
  };

  // 2. Топ-10 жанров
  const genreMap = new Map();
  books.forEach(book => {
    const genres = book.genres || [];
    genres.forEach(genre => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });
  const topGenres = Array.from(genreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const genreData = {
    labels: topGenres.map(item => item[0]),
    datasets: [
      {
        label: 'Количество книг',
        data: topGenres.map(item => item[1]),
        backgroundColor: '#667eea',
        borderRadius: 8,
      },
    ],
  };

  // 3. Распределение по десятилетиям
  const yearMap = new Map();
  books.forEach(book => {
    const year = book.publishedYear;
    if (year && !isNaN(year)) {
      const decade = Math.floor(year / 10) * 10;
      yearMap.set(decade, (yearMap.get(decade) || 0) + 1);
    }
  });
  const sortedYears = Array.from(yearMap.entries()).sort((a, b) => a[0] - b[0]);

  const yearData = {
    labels: sortedYears.map(item => `${item[0]}‑${item[0] + 9}`),
    datasets: [
      {
        label: 'Количество книг',
        data: sortedYears.map(item => item[1]),
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 4. Дополнительные показатели
  const authorCount = new Set(books.flatMap(b => b.authorNames)).size;
  const avgBooksPerAuthor = (books.length / authorCount).toFixed(2);

  // ========== Рендер ==========
  return (
    <div className="statistics-page">
      <h1 className="page-title">📊 Моя статистика чтения</h1>

      <div className="stats-summary">
        <div className="summary-card">
          <span className="summary-icon">📚</span>
          <div>
            <h3>Всего книг</h3>
            <p className="summary-value">{books.length}</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">✅</span>
          <div>
            <h3>Прочитано</h3>
            <p className="summary-value">{statusCounts.read}</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">✍️</span>
          <div>
            <h3>Авторов</h3>
            <p className="summary-value">{authorCount}</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">📖</span>
          <div>
            <h3>Книг на автора</h3>
            <p className="summary-value">{avgBooksPerAuthor}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Статусы книг</h2>
          <div className="chart-container">
            <Pie data={statusData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-card">
          <h2>Топ‑10 жанров</h2>
          <div className="chart-container">
            <Bar
              data={genreData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card chart-card-wide">
          <h2>Книги по десятилетиям</h2>
          <div className="chart-container">
            <Line
              data={yearData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: { mode: 'index' },
                },
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: 'Количество книг' } },
                  x: { title: { display: true, text: 'Десятилетие' } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;