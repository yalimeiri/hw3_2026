import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateUserForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/users', { name, email, username, password });
      navigate('/');
    } catch {
      setError('Could not create user');
    }
  };

  return (
    <form data-testid="create_user_form" onSubmit={handleSubmit} className="auth-form">
      <h2>Create User</h2>
      <label>
        Name
        <input
          data-testid="create_user_form_name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          data-testid="create_user_form_email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Username
        <input
          data-testid="create_user_form_username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <label>
        Password
        <input
          data-testid="create_user_form_password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && <p className="auth-error">{error}</p>}
      <button
        data-testid="create_user_form_create_user"
        type="submit"
        className="neon-btn"
      >
        Create User
      </button>
    </form>
  );
};

export default CreateUserForm;
