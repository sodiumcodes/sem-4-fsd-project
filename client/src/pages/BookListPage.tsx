import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { booksApi } from '../api/client';
import type { Book } from '../types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';

export const BookListPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [titleSearch, setTitleSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  // Add Book modal / inline form state
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    genre: '',
    totalCopies: 5,
    availableCopies: 5,
  });

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await booksApi.getAll({
        genre: selectedGenre || undefined,
        limit: 100,
      });
      setBooks(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedGenre]);

  // Extract distinct genres for the dropdown
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    books.forEach((b) => {
      if (b.genre) genresSet.add(b.genre);
    });
    return Array.from(genresSet).sort();
  }, [books]);

  // Filter books locally by title search
  const filteredBooks = useMemo(() => {
    if (!titleSearch.trim()) return books;
    const term = titleSearch.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(term));
  }, [books, titleSearch]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await booksApi.create({
        ...newBook,
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.availableCopies),
      });
      setFormSuccess(`Book "${newBook.title.toUpperCase()}" added successfully!`);
      setNewBook({
        title: '',
        author: '',
        ISBN: '',
        genre: '',
        totalCopies: 5,
        availableCopies: 5,
      });
      setShowAddForm(false);
      fetchBooks();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define columns for typed generic DataTable<Book>
  const columns: Column<Book>[] = [
    {
      header: 'Title',
      accessor: (book) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-dark)' }}>
            {book.title}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)', marginTop: '0.2rem' }}>
            ISBN: {book.ISBN}
          </div>
        </div>
      ),
    },
    {
      header: 'Author',
      accessor: (book) => <span style={{ fontWeight: 600 }}>{book.author}</span>,
    },
    {
      header: 'Genre',
      accessor: (book) => (
        <span className="badge badge-returned">
          {book.genre}
        </span>
      ),
    },
    {
      header: 'Copies',
      accessor: (book) => (
        <span style={{ fontWeight: 700 }}>
          {book.availableCopies} / {book.totalCopies}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (book) => {
        const isAvailable = book.availableCopies > 0;
        return (
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-overdue'}`}>
            {isAvailable ? `${book.availableCopies} AVAILABLE` : 'OUT OF STOCK'}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: (book) => {
        const isAvailable = book.availableCopies > 0;
        return (
          <Link
            to={isAvailable ? `/borrow?bookId=${book._id}` : '#'}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              pointerEvents: isAvailable ? 'auto' : 'none',
              opacity: isAvailable ? 1 : 0.6,
            }}
          >
            ISSUE BOOK
          </Link>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">LIBRARY BOOK CATALOG</h2>
          <p className="page-subtitle">BROWSE, SEARCH, AND MANAGE BOOKS IN THE COLLEGE LIBRARY</p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="btn btn-primary"
          >
            {showAddForm ? 'CLOSE ADD FORM' : '+ ADD NEW BOOK'}
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="toast-box toast-success" role="status">
          <span>[SUCCESS]</span>
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Add Book Form (Librarian Only) */}
      {showAddForm && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--color-dark)' }}>
            ADD BOOK TO CATALOG
          </h3>

          {formError && (
            <div className="toast-box toast-error" role="alert">
              <span>[ERROR]</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddBook}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="new-title">
                  Title *
                </label>
                <input
                  id="new-title"
                  className="form-input"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. Clean Architecture"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-author">
                  Author *
                </label>
                <input
                  id="new-author"
                  className="form-input"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="e.g. Robert C. Martin"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-isbn">
                  ISBN *
                </label>
                <input
                  id="new-isbn"
                  className="form-input"
                  value={newBook.ISBN}
                  onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })}
                  placeholder="e.g. 978-0134494166"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-genre">
                  Genre *
                </label>
                <input
                  id="new-genre"
                  className="form-input"
                  value={newBook.genre}
                  onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-total">
                  Total Copies *
                </label>
                <input
                  id="new-total"
                  type="number"
                  min="0"
                  className="form-input"
                  value={newBook.totalCopies}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setNewBook({ ...newBook, totalCopies: val, availableCopies: val });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-avail">
                  Available Copies *
                </label>
                <input
                  id="new-avail"
                  type="number"
                  min="0"
                  max={newBook.totalCopies}
                  className="form-input"
                  value={newBook.availableCopies}
                  onChange={(e) =>
                    setNewBook({ ...newBook, availableCopies: parseInt(e.target.value, 10) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'SAVING BOOK...' : 'SAVE BOOK'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar in its own bordered card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 280px' }}>
          <label htmlFor="search-title" className="form-label">
            FILTER BY TITLE
          </label>
          <input
            id="search-title"
            type="text"
            className="form-input"
            placeholder="Type to filter titles..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: '0 1 260px' }}>
          <label htmlFor="filter-genre" className="form-label">
            FILTER BY GENRE
          </label>
          <select
            id="filter-genre"
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">ALL GENRES</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {(titleSearch || selectedGenre) && (
          <div>
            <button
              onClick={() => {
                setTitleSearch('');
                setSelectedGenre('');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.25rem' }}
            >
              RESET FILTERS
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="toast-box toast-error" role="alert">
          <span>[ERROR]</span>
          <span>{error}</span>
          <button
            onClick={fetchBooks}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Reusable Generic DataTable Component for Books */}
      <DataTable<Book>
        data={filteredBooks}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        emptyMessage={
          titleSearch || selectedGenre
            ? 'NO BOOKS MATCH YOUR SEARCH CRITERIA.'
            : 'NO BOOKS FOUND IN THE LIBRARY CATALOG.'
        }
      />
    </div>
  );
};
