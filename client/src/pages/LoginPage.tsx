import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to previously requested page, or default to /books
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/books';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-light)',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-button)',
              fontWeight: 800,
              fontSize: '1.75rem',
              fontFamily: 'var(--font-heading)',
              marginBottom: '1rem',
            }}
          >
            S
          </span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-dark)' }}>
            LIBRARIAN SIGN IN
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-dark)',
              fontWeight: 700,
              marginTop: '0.4rem',
            }}
          >
            ACCESS THE SHELFLIFE ADMINISTRATION PLATFORM
          </p>
        </div>

        {error && (
          <div className="toast-box toast-error" role="alert">
            <span>[ERROR]</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Librarian Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. librarian@shelflife.edu"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN TO SHELFLIFE'}
          </button>
        </form>
      </div>
    </div>
  );
};
