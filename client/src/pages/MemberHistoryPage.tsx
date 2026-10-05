import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { membersApi, borrowApi } from '../api/client';
import type { Member, BorrowRecord, Book } from '../types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Select } from '../components/Select';
import { useAuth } from '../context/AuthContext';

export const MemberHistoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMemberId = searchParams.get('memberId') || '';

  const { isAuthenticated } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<BorrowRecord[]>([]);

  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const res = await membersApi.getAll();
        setMembers(res.data);
        if (!selectedMemberId && res.data.length > 0) {
          setSelectedMemberId(res.data[0]._id);
        }
      } catch (err: unknown) {
        setToastMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to load library members',
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch history whenever selected member changes
  const fetchMemberHistory = async (memberId: string) => {
    if (!memberId) return;
    setIsLoadingHistory(true);
    setToastMessage(null);
    try {
      const res = await membersApi.getHistory(memberId);
      setCurrentMember(res.member);
      setHistory(res.data);
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to retrieve member borrowing history',
      });
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberHistory(selectedMemberId);
    }
  }, [selectedMemberId]);

  // Handle return book
  const handleReturnBook = async (borrowId: string, bookTitle: string) => {
    setReturningId(borrowId);
    try {
      const res = await borrowApi.returnBook(borrowId);
      setToastMessage({
        type: 'success',
        text: `"${bookTitle}" returned successfully! Remaining available copies: ${res.bookAvailableCopies}`,
      });
      // Refresh history
      if (selectedMemberId) {
        fetchMemberHistory(selectedMemberId);
      }
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to return book',
      });
    } finally {
      setReturningId(null);
    }
  };

  // Check if a record is overdue: dueDate < today and not yet returned
  const isRecordOverdue = (record: BorrowRecord): boolean => {
    if (record.returnDate || record.status === 'returned') return false;
    const dueTime = new Date(record.dueDate).getTime();
    const now = new Date().getTime();
    return dueTime < now || record.status === 'overdue';
  };

  // Define columns for typed generic DataTable<BorrowRecord>
  const columns: Column<BorrowRecord>[] = [
    {
      header: 'Book',
      accessor: (record) => {
        const bookObj = typeof record.book === 'object' ? (record.book as Book) : null;
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-palette-1)' }}>
              {bookObj ? bookObj.title : 'Book ID: ' + record.book}
            </div>
            {bookObj && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-palette-2)' }}>
                {bookObj.author} • {bookObj.genre} (ISBN: {bookObj.ISBN})
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Issue Date',
      accessor: (record) => new Date(record.issueDate).toLocaleDateString(),
    },
    {
      header: 'Due Date',
      accessor: (record) => (
        <span style={{ fontWeight: isRecordOverdue(record) ? 700 : 400 }}>
          {new Date(record.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Return Date',
      accessor: (record) =>
        record.returnDate ? (
          new Date(record.returnDate).toLocaleDateString()
        ) : (
          <span style={{ color: 'var(--color-palette-2)', fontStyle: 'italic' }}>Pending</span>
        ),
    },
    {
      header: 'Status',
      accessor: (record) => {
        const overdue = isRecordOverdue(record);
        if (overdue) {
          return (
            <span
              className="badge badge-overdue"
              style={{
                backgroundColor: 'var(--color-palette-1)',
                color: '#ffffff',
                border: '2px solid var(--color-palette-4)',
                padding: '0.3rem 0.6rem',
              }}
            >
              ⚠ Overdue
            </span>
          );
        }
        if (record.status === 'returned') {
          return <span className="badge badge-returned">Returned</span>;
        }
        return <span className="badge badge-issued">Issued</span>;
      },
    },
    {
      header: 'Action',
      accessor: (record) => {
        const isReturned = record.status === 'returned' || !!record.returnDate;
        const bookTitle =
          typeof record.book === 'object' ? (record.book as Book).title : 'Book';

        if (isReturned) {
          return <span style={{ color: 'var(--color-palette-4)', fontSize: '0.85rem' }}>Completed</span>;
        }

        return isAuthenticated ? (
          <button
            onClick={() => handleReturnBook(record._id, bookTitle)}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            disabled={returningId === record._id}
          >
            {returningId === record._id ? 'Returning...' : 'Return Book'}
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-palette-2)' }}>Login to Return</span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Member Borrow History</h2>
          <p className="page-subtitle">Track issued books, return dates, and overdue items</p>
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

      {/* Member Selector Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {isLoadingMembers ? (
          <p style={{ color: 'var(--color-palette-2)' }}>Loading registered members...</p>
        ) : members.length === 0 ? (
          <p style={{ color: 'var(--color-palette-1)' }}>No members registered yet.</p>
        ) : (
          <Select<Member>
            id="history-member-select"
            label="Select Member to View History"
            options={members}
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            getOptionValue={(m) => m._id}
            getOptionLabel={(m) => `${m.name} (${m.membershipId}) — ${m.email}`}
            placeholder="-- Choose a member --"
          />
        )}
      </div>

      {/* Member Details Summary */}
      {currentMember && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-palette-4)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-palette-1)' }}>
              {currentMember.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-palette-2)' }}>
              Membership ID: <strong>{currentMember.membershipId}</strong> | Email: {currentMember.email}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.85rem',
                backgroundColor: '#f4f7f5',
                border: '1px solid var(--color-palette-4)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-palette-1)',
                fontWeight: 600,
              }}
            >
              Total Records: {history.length}
            </span>
          </div>
        </div>
      )}

      {/* History DataTable */}
      <DataTable<BorrowRecord>
        data={history}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoadingHistory}
        emptyMessage="This member has no borrowing history."
      />
    </div>
  );
};
