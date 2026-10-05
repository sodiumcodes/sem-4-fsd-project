import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { BookListPage } from './pages/BookListPage';
import { IssueBookPage } from './pages/IssueBookPage';
import { MemberHistoryPage } from './pages/MemberHistoryPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/books" element={<BookListPage />} />
              <Route path="/members" element={<MemberHistoryPage />} />

              {/* Protected Routes */}
              <Route
                path="/borrow"
                element={
                  <ProtectedRoute>
                    <IssueBookPage />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/books" replace />} />
              <Route path="*" element={<Navigate to="/books" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
