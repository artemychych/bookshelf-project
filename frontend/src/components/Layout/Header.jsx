import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link to="/">📚 BookShelf</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/books">Каталог книг</Link></li>
          {!user ? (
            <>
              <li><Link to="/login">Войти</Link></li>
              <li><Link to="/register">Зарегистрироваться</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/statistics">📊 Моя статистика</Link></li>
              <li><span className="user-name">Привет, {user.name}</span></li>
              <li><button className="logout-btn" onClick={logout}>Выйти</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;