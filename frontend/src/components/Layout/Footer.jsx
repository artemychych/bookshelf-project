import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2026 BookShelf. Все права защищены.</p>
        <ul className="footer-links">
          <li><Link to="/about">О нас</Link></li>
          <li><Link to="/privacy">Конфиденциальность</Link></li>
          <li><Link to="/terms">Условия использования</Link></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;