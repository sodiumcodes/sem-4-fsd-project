import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksApi, membersApi, borrowApi } from '../api/client';
import type { Book, Member } from '../types';
import { Select } from '../components/Select';

export const IssueBookPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get('bookId') || '';
  const preselectedMemberId = searchParams.get('memberId') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Form states
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMemberId);

  // Default due date: 14 days from today
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Register Member form state
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipId: '' });
  const [isCreatingMember, setIsCreatingMember] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [booksRes, membersRes] = await Promise.all([
        booksApi.getAll({ limit: 100 }),
        membersApi.getAll(),
      ]);
      setBooks(booksRes.data);
      setMembers(membersRes.data);

      if (preselectedBookId) {
        setSelectedBookId(preselectedBookId);
      }
      if (preselectedMemberId) {
        setSelectedMemberId(preselectedMemberId);
      }
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load library resources',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId || !dueDate) {
      setToastMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const res = await borrowApi.issue({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        dueDate: new Date(dueDate).toISOString(),
      });

      const selectedBook = books.find((b) => b._id === selectedBookId);
      const selectedMember = members.find((m) => m._id === selectedMemberId);

      setToastMessage({
        type: 'success',
        text: `Book "${selectedBook?.title || 'Book'}" successfully issued to ${
          selectedMember?.name || 'Member'
        }! Remaining copies: ${res.bookAvailableCopies}`,
      });

      // Refresh list to update available copies
      loadData();
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to issue book',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMember(true);
    try {
      const res = await membersApi.create(newMember);
      if (res.data) {
        setMembers((prev) => [res.data!, ...prev]);
        setSelectedMemberId(res.data._id);
      }
      setShowMemberModal(false);
      setNewMember({ name: '', email: '', membershipId: '' });
      setToastMessage({
        type: 'success',
        text: `Member "${newMember.name}" registered successfully!`,
      });
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to register member',
      });
    } finally {
      setIsCreatingMember(false);
    }
  };

  const selectedBook = books.find((b) => b._id === selectedBookId);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">ISSUE A BOOK</h2>
          <p className="page-subtitle">RECORD BOOK BORROWING FOR COLLEGE LIBRARY MEMBERS</p>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`toast-box ${
            toastMessage.type === 'success' ? 'toast-success' : 'toast-error'
          }`}
          role="status"
        >
          <span>{toastMessage.type === 'success' ? '[SUCCESS]' : '[ERROR]'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Issue Book Form Card */}
      <div className="card">
        {isLoadingData ? (
          <div className="nb-loading-box">
            LOADING CATALOG & MEMBERS...
          </div>
        ) : (
          <form onSubmit={handleIssueSubmit}>
            {/* Generic Typed Select for Books */}
            <Select<Book>
              id="select-book"
              label="SELECT BOOK"
              options={books}
              value={selectedBookId}
              onChange={setSelectedBookId}
              getOptionValue={(b) => b._id}
              getOptionLabel={(b) =>
                `${b.title.toUpperCase()} — BY ${b.author.toUpperCase()} (${b.availableCopies} OF ${b.totalCopies} COPIES AVAILABLE)`
              }
              placeholder="-- CHOOSE A BOOK FROM THE CATALOG --"
              required
            />

            {selectedBook && selectedBook.availableCopies <= 0 && (
              <div
                className="badge badge-overdue"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  padding: '0.75rem',
                }}
              >
                WARNING: THIS BOOK HAS 0 AVAILABLE COPIES IN STOCK.
              </div>
            )}

            {/* Generic Typed Select for Members */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <Select<Member>
                  id="select-member"
                  label="SELECT MEMBER"
                  options={members}
                  value={selectedMemberId}
                  onChange={setSelectedMemberId}
                  getOptionValue={(m) => m._id}
                  getOptionLabel={(m) => `${m.name.toUpperCase()} (${m.membershipId}) — ${m.email}`}
                  placeholder="-- CHOOSE A REGISTERED MEMBER --"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMemberModal((prev) => !prev)}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {showMemberModal ? 'CLOSE FORM' : '+ NEW MEMBER'}
                </button>
              </div>
            </div>

            {/* Inline Quick Member Registration */}
            {showMemberModal && (
              <div
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: 'var(--border-thick)',
                  boxShadow: 'var(--shadow-card)',
                  padding: '1.5rem',
                  marginBottom: '1.75rem',
                }}
              >
                <h4 style={{ color: 'var(--color-dark)', marginBottom: '1rem', fontSize: '1.15rem' }}>
                  QUICK MEMBER REGISTRATION
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input
                    className="form-input"
                    placeholder="Full Name *"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="Email Address *"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="Membership ID * (e.g. MEM-101)"
                    value={newMember.membershipId}
                    onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCreateMember}
                    className="btn btn-primary"
                    disabled={isCreatingMember || !newMember.name || !newMember.email || !newMember.membershipId}
                  >
                    {isCreatingMember ? 'REGISTERING...' : 'REGISTER MEMBER'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Due Date Input */}
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                DUE DATE *
              </label>
              <input
                id="dueDate"
                type="date"
                className="form-input"
                value={dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                disabled={isSubmitting || !selectedBookId || !selectedMemberId || selectedBook?.availableCopies === 0}
              >
                {isSubmitting ? 'ISSUING...' : 'CONFIRM & ISSUE BOOK'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
