// src/components/UserSelector.jsx

import React from 'react';

// 프로토타입용 가상 사용자 데이터
const USERS = [
  {
    id: 'user1',
    name: '김민준',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=user1',
    color: '#4285F4',
  },
  {
    id: 'user2',
    name: '이지은',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=user2',
    color: '#EA4335',
  },
  {
    id: 'user3',
    name: '박서준',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=user3',
    color: '#34A853',
  },
];

const UserSelector = ({ onSelectUser, selectedUserId }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
      <h2
        style={{
          marginBottom: '20px',
          fontSize: '1.5rem',
        }}>
        사용자 프로필 선택
      </h2>
      <p style={{ marginBottom: '20px', textAlign: 'center' }}>
        하이라이트를 공유하기 위해 사용할 프로필을 선택하세요.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
        }}>
        {USERS.map(user => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              cursor: 'pointer',
              border:
                user.id === selectedUserId
                  ? `3px solid ${user.color}`
                  : '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '150px',
              boxShadow:
                user.id === selectedUserId
                  ? `0 0 10px ${user.color}40`
                  : 'none',
              transition: 'all 0.2s ease',
            }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '10px',
                border: `2px solid ${user.color}`,
              }}
            />
            <div style={{ fontWeight: 'bold', color: user.color }}>
              {user.name}
            </div>
            {user.id === selectedUserId && (
              <div
                style={{
                  marginTop: '10px',
                  backgroundColor: user.color,
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}>
                선택됨
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;

// 사용자 목록을 외부에서도 사용할 수 있도록 내보내기
export { USERS };
