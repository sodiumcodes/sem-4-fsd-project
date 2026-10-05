import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '0.5rem 0.9rem',
    fontFamily: 'var(--font-heading)',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    fontSize: '0.95rem',
    color: isActive ? 'var(--color-dark)' : 'var(--color-light)',
    backgroundColor: isActive ? 'var(--color-bg)' : 'transparent',
    border: '3px solid var(--color-light)',
    boxShadow: isActive ? '3px 3px 0 var(--color-light)' : 'none',
    transition: 'transform 120ms ease, box-shadow 120ms ease',
    display: 'inline-block',
  });

  return (
    <header
      style={{
        backgroundColor: 'var(--color-dark)',
        borderBottom: 'var(--border-thick)',
        padding: '1rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-light)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-dark)',
              border: '3px solid var(--color-light)',
              boxShadow: '3px 3px 0 var(--color-light)',
              fontWeight: 800,
              fontSize: '1.25rem',
              fontFamily: 'var(--font-heading)',
            }}
          >
            S
          </span>
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                lineHeight: 1,
                color: 'var(--color-light)',
                letterSpacing: '-0.5px',
              }}
            >
              SHELFLIFE
            </h1>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-light)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '0.2rem',
              }}
            >
              College Library Platform
            </p>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAuthenticated && (
            <>
              <NavLink to="/books" style={getNavLinkStyle}>
                Books
              </NavLink>
              <NavLink to="/borrow" style={getNavLinkStyle}>
                Issue Book
              </NavLink>
              <NavLink to="/members" style={getNavLinkStyle}>
                Member History
              </NavLink>
            </>
          )}

          <div
            style={{
              marginLeft: '0.5rem',
              paddingLeft: '0.75rem',
              borderLeft: '3px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {isAuthenticated ? (
              <>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--color-light)',
                    backgroundColor: 'var(--color-primary)',
                    padding: '0.35rem 0.65rem',
                    border: '3px solid var(--color-light)',
                  }}
                >
                  Librarian
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-dark)',
                    border: '3px solid var(--color-light)',
                    boxShadow: '3px 3px 0 var(--color-light)',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-light)',
                  border: '3px solid var(--color-light)',
                  boxShadow: '3px 3px 0 var(--color-light)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                }}
              >
                Librarian Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
