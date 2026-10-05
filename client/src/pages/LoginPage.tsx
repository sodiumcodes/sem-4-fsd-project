import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('librarian@shelflife.edu');
  const [password, setPassword] = useState('Librarian@123');
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
          maxWidth: '440px',
          border: '2px solid var(--color-palette-2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-palette-2)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            S
          </span>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-palette-1)' }}>Librarian Sign In</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-palette-2)', marginTop: '0.25rem' }}>
            Access the ShelfLife administration platform
          </p>
        </div>

        {error && (
          <div className="toast-box toast-error" role="alert">
            {error}
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
              placeholder="librarian@shelflife.edu"
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
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              backgroundColor: '#f4f7f5',
              border: '1px solid var(--color-palette-4)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              color: 'var(--color-palette-1)',
            }}
          >
            <strong>Default Credentials:</strong>
            <br />
            Email: <code>librarian@shelflife.edu</code>
            <br />
            Password: <code>Librarian@123</code>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to ShelfLife'}
          </button>
        </form>
      </div>
    </div>
  );
};
