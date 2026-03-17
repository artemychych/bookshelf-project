import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login success:', response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
};

export default LoginForm;