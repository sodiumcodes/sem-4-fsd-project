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
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Issue a Book</h2>
          <p className="page-subtitle">Record book borrowing for library members</p>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`toast-box ${
            toastMessage.type === 'success' ? 'toast-success' : 'toast-error'
          }`}
          role="status"
        >
          {toastMessage.text}
        </div>
      )}

      {/* Main Issue Book Form Card */}
      <div className="card">
        {isLoadingData ? (
          <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-palette-2)' }}>
            Loading library books and members...
          </p>
        ) : (
          <form onSubmit={handleIssueSubmit}>
            {/* Generic Typed Select for Books */}
            <Select<Book>
              id="select-book"
              label="Select Book"
              options={books}
              value={selectedBookId}
              onChange={setSelectedBookId}
              getOptionValue={(b) => b._id}
              getOptionLabel={(b) =>
                `${b.title} — by ${b.author} (${b.availableCopies} of ${b.totalCopies} available)`
              }
              placeholder="-- Choose a book from the catalog --"
              required
            />

            {selectedBook && selectedBook.availableCopies <= 0 && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  backgroundColor: 'var(--color-palette-1)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                }}
              >
                Warning: This book currently has 0 available copies in stock.
              </div>
            )}

            {/* Generic Typed Select for Members */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Select<Member>
                  id="select-member"
                  label="Select Member"
                  options={members}
                  value={selectedMemberId}
                  onChange={setSelectedMemberId}
                  getOptionValue={(m) => m._id}
                  getOptionLabel={(m) => `${m.name} (${m.membershipId}) - ${m.email}`}
                  placeholder="-- Choose a registered member --"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMemberModal((prev) => !prev)}
                  className="btn btn-outline"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + New Member
                </button>
              </div>
            </div>

            {/* Inline Quick Member Registration */}
            {showMemberModal && (
              <div
                style={{
                  backgroundColor: '#f4f7f5',
                  border: '1px solid var(--color-palette-4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h4 style={{ color: 'var(--color-palette-1)', marginBottom: '0.75rem' }}>
                  Quick Member Registration
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
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
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCreateMember}
                    className="btn btn-primary"
                    disabled={isCreatingMember || !newMember.name || !newMember.email || !newMember.membershipId}
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    {isCreatingMember ? 'Registering...' : 'Register Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Due Date Input */}
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Due Date <span style={{ color: 'var(--color-palette-3)' }}>*</span>
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

            <div style={{ marginTop: '1.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={isSubmitting || !selectedBookId || !selectedMemberId || selectedBook?.availableCopies === 0}
              >
                {isSubmitting ? 'Issuing Book...' : 'Confirm & Issue Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
