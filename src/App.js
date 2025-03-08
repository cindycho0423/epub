// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import EPubViewer from './components/EPubViewer';
import UserSelector, { USERS } from './components/UserSelector';

function App() {
  // 선택된 사용자 상태 관리
  const [selectedUser, setSelectedUser] = useState(null);
  // 사용자가 선택되었는지 여부를 추적
  const [userSelected, setUserSelected] = useState(false);
  // 책 ID 상태 (실제 애플리케이션에서는 동적으로 변경될 수 있음)
  const [bookId, setBookId] = useState('sample_book_1');

  // 로컬 스토리지에서 이전에 선택한 사용자 정보 불러오기
  useEffect(() => {
    const savedUserId = localStorage.getItem('selectedUserId');
    if (savedUserId) {
      const user = USERS.find(u => u.id === savedUserId);
      if (user) {
        setSelectedUser(user);
        setUserSelected(true);
      }
    }
  }, []);

  // 사용자 선택 처리 함수
  const handleSelectUser = user => {
    setSelectedUser(user);
    // 로컬 스토리지에 선택한 사용자 ID 저장 (브라우저 새로고침 시 유지)
    localStorage.setItem('selectedUserId', user.id);
  };

  // 사용자 선택 확인 함수
  const confirmUserSelection = () => {
    setUserSelected(true);
  };

  // 사용자 변경 함수
  const changeUser = () => {
    setUserSelected(false);
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1 style={{ margin: '20px 0' }}>Bookiwi</h1>

        {/* 선택된 사용자가 있고 사용자 선택 화면이 아닌 경우 현재 사용자 표시 */}
        {selectedUser && userSelected && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 15px',
              backgroundColor: selectedUser.color + '20',
              borderRadius: '20px',
              margin: '0 0 10px 0',
            }}>
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                marginRight: '10px',
                border: `1px solid ${selectedUser.color}`,
              }}
            />
            <span>{selectedUser.name}님으로 읽는 중</span>
            <button
              onClick={changeUser}
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                color: '#4285F4',
                cursor: 'pointer',
                fontSize: '0.8em',
              }}>
              사용자 변경
            </button>
          </div>
        )}
      </header>

      {/* 사용자 선택 단계 */}
      {!userSelected ? (
        <div>
          <UserSelector
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUser?.id}
          />
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              onClick={confirmUserSelection}
              disabled={!selectedUser}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedUser ? '#4285F4' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: selectedUser ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
              }}>
              선택 완료
            </button>
          </div>
        </div>
      ) : (
        // 사용자 선택 후 EPUB 뷰어 표시
        <EPubViewer
          url='../epub_sample.epub'
          bookId={bookId}
          currentUser={selectedUser}
        />
      )}

      <footer
        style={{
          marginTop: '20px',
          padding: '20px',
          borderTop: '1px solid #eee',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8rem',
        }}>
        <p>© 2025 Bookiwi - 프로토타입 버전</p>
      </footer>
    </div>
  );
}

export default App;
