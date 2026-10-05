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
        text: `"${bookTitle.toUpperCase()}" returned successfully! Remaining available copies: ${res.bookAvailableCopies}`,
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
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-dark)' }}>
              {bookObj ? bookObj.title.toUpperCase() : 'BOOK ID: ' + record.book}
            </div>
            {bookObj && (
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark)', marginTop: '0.2rem' }}>
                BY {bookObj.author.toUpperCase()} • {bookObj.genre.toUpperCase()} (ISBN: {bookObj.ISBN})
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
        <span style={{ fontWeight: isRecordOverdue(record) ? 700 : 600 }}>
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
          <span style={{ fontWeight: 700 }}>PENDING</span>
        ),
    },
    {
      header: 'Status',
      accessor: (record) => {
        const overdue = isRecordOverdue(record);
        if (overdue) {
          return (
            <span className="badge badge-overdue">
              [OVERDUE]
            </span>
          );
        }
        if (record.status === 'returned') {
          return <span className="badge badge-returned">RETURNED</span>;
        }
        return <span className="badge badge-issued">ISSUED</span>;
      },
    },
    {
      header: 'Action',
      accessor: (record) => {
        const isReturned = record.status === 'returned' || !!record.returnDate;
        const bookTitle =
          typeof record.book === 'object' ? (record.book as Book).title : 'Book';

        if (isReturned) {
          return <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>COMPLETED</span>;
        }

        return isAuthenticated ? (
          <button
            onClick={() => handleReturnBook(record._id, bookTitle)}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            disabled={returningId === record._id}
          >
            {returningId === record._id ? 'RETURNING...' : 'RETURN BOOK'}
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>LOGIN TO RETURN</span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">MEMBER BORROW HISTORY</h2>
          <p className="page-subtitle">TRACK ISSUED BOOKS, RETURN DATES, AND OVERDUE ITEMS</p>
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

      {/* Member Selector Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        {isLoadingMembers ? (
          <div className="nb-loading-box">
            LOADING REGISTERED MEMBERS...
          </div>
        ) : members.length === 0 ? (
          <p style={{ fontWeight: 700 }}>NO MEMBERS REGISTERED YET.</p>
        ) : (
          <Select<Member>
            id="history-member-select"
            label="SELECT MEMBER TO VIEW HISTORY"
            options={members}
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            getOptionValue={(m) => m._id}
            getOptionLabel={(m) => `${m.name.toUpperCase()} (${m.membershipId}) — ${m.email}`}
            placeholder="-- CHOOSE A MEMBER --"
          />
        )}
      </div>

      {/* Member Details Summary Card */}
      {currentMember && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-dark)' }}>
              {currentMember.name.toUpperCase()}
            </h3>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-dark)', marginTop: '0.35rem' }}>
              MEMBERSHIP ID: <strong>{currentMember.membershipId}</strong> | EMAIL: {currentMember.email}
            </p>
          </div>
          <div>
            <span className="badge badge-issued" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              TOTAL RECORDS: {history.length}
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
        emptyMessage="THIS MEMBER HAS NO BORROWING HISTORY."
      />
    </div>
  );
};
