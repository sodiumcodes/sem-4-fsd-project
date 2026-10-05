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

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    color: '#ffffff',
    fontWeight: isActive ? 700 : 500,
    backgroundColor: isActive ? 'var(--color-palette-3)' : 'transparent',
    fontSize: '0.925rem',
    transition: 'background-color 0.15s ease',
  });

  return (
    <header
      style={{
        backgroundColor: 'var(--color-palette-1)',
        borderBottom: '2px solid var(--color-palette-2)',
        padding: '0.75rem 1.5rem',
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
            gap: '0.5rem',
            color: '#ffffff',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-palette-3)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            S
          </span>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1 }}>
              ShelfLife
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-palette-4)' }}>
              College Library Platform
            </p>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <NavLink to="/books" style={navLinkStyle}>
            Books
          </NavLink>
          <NavLink to="/borrow" style={navLinkStyle}>
            Issue Book
          </NavLink>
          <NavLink to="/members" style={navLinkStyle}>
            Member History
          </NavLink>

          <div
            style={{
              marginLeft: '0.75rem',
              paddingLeft: '0.75rem',
              borderLeft: '1px solid var(--color-palette-2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isAuthenticated ? (
              <>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-palette-4)',
                    padding: '0.2rem 0.5rem',
                    border: '1px solid var(--color-palette-3)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Librarian
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{
                    color: '#ffffff',
                    borderColor: 'var(--color-palette-4)',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
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
