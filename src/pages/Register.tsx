import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const clearError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ username, password, confirmPassword });
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Create Admin</h2>
        {error && <div className="notice notice--error">{error}</div>}
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError('username');
            }}
            className={fieldErrors.username ? 'input--error' : undefined}
          />
          {fieldErrors.username && <span className="field__error">{fieldErrors.username}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError('password');
            }}
            className={fieldErrors.password ? 'input--error' : undefined}
          />
          {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError('confirmPassword');
            }}
            className={fieldErrors.confirmPassword ? 'input--error' : undefined}
          />
          {fieldErrors.confirmPassword && (
            <span className="field__error">{fieldErrors.confirmPassword}</span>
          )}
        </div>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
