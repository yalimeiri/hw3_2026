import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/login', { username, password });
      login({
        token: response.data.token,
        username: response.data.username,
        name: response.data.name,
        email: response.data.email,
      });
      navigate('/');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <form data-testid="login_form" onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
      <label>
        Username
        <input
          data-testid="login_form_username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <label>
        Password
        <input
          data-testid="login_form_password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && <p className="auth-error">{error}</p>}
      <button data-testid="login_form_login" type="submit" className="neon-btn">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
