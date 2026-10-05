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
      setFormSuccess(`Book "${newBook.title}" added successfully!`);
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
          <div style={{ fontWeight: 600, color: 'var(--color-palette-1)' }}>{book.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-palette-2)' }}>ISBN: {book.ISBN}</div>
        </div>
      ),
    },
    {
      header: 'Author',
      accessor: 'author',
    },
    {
      header: 'Genre',
      accessor: (book) => (
        <span
          style={{
            fontSize: '0.825rem',
            padding: '0.2rem 0.5rem',
            backgroundColor: '#f4f7f5',
            border: '1px solid var(--color-palette-4)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-palette-2)',
            fontWeight: 500,
          }}
        >
          {book.genre}
        </span>
      ),
    },
    {
      header: 'Copies',
      accessor: (book) => (
        <div style={{ fontSize: '0.875rem' }}>
          <span>
            {book.availableCopies} / {book.totalCopies}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (book) => {
        const isAvailable = book.availableCopies > 0;
        return (
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-overdue'}`}>
            {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: (book) => (
        <Link
          to={`/borrow?bookId=${book._id}`}
          className="btn btn-outline"
          style={{
            padding: '0.3rem 0.65rem',
            fontSize: '0.8rem',
            borderColor: book.availableCopies > 0 ? 'var(--color-palette-3)' : 'var(--color-palette-4)',
            color: book.availableCopies > 0 ? 'var(--color-palette-2)' : 'var(--color-palette-4)',
            pointerEvents: book.availableCopies > 0 ? 'auto' : 'none',
            opacity: book.availableCopies > 0 ? 1 : 0.5,
          }}
        >
          Issue Book
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Library Book Catalog</h2>
          <p className="page-subtitle">Browse, search, and manage books in the college library</p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Close Add Form' : '+ Add New Book'}
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="toast-box toast-success" role="status">
          {formSuccess}
        </div>
      )}

      {/* Add Book Form (Librarian Only) */}
      {showAddForm && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            border: '2px solid var(--color-palette-3)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-palette-1)' }}>
            Add Book to Catalog
          </h3>

          {formError && (
            <div className="toast-box toast-error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddBook}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
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

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Book...' : 'Save Book'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <label
            htmlFor="search-title"
            style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-palette-1)' }}
          >
            Filter by Title
          </label>
          <input
            id="search-title"
            type="text"
            className="form-input"
            style={{ width: '100%' }}
            placeholder="Type to filter titles..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: '0 1 220px' }}>
          <label
            htmlFor="filter-genre"
            style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-palette-1)' }}
          >
            Filter by Genre
          </label>
          <select
            id="filter-genre"
            className="form-select"
            style={{ width: '100%' }}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {(titleSearch || selectedGenre) && (
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={() => {
                setTitleSearch('');
                setSelectedGenre('');
              }}
              className="btn btn-outline"
              style={{ padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="toast-box toast-error" role="alert">
          {error}
          <button
            onClick={fetchBooks}
            className="btn btn-outline"
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ffffff', borderColor: '#ffffff' }}
          >
            Retry
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
            ? 'No books match your search criteria.'
            : 'No books found in the library catalog.'
        }
      />
    </div>
  );
};
