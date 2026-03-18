import { Link } from 'react-router-dom';
import './Header.css'; // импортируем стили

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link to="/">📚 BookShelf</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/books">Каталог книг</Link></li>
          <li><Link to="/login">Войти</Link></li>
          <li><Link to="/register">Зарегистрироваться</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;