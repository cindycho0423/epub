import React from 'react';
// 타입 정의
export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface Highlight {
  id: string;
  text: string;
  cfi: string;
  color: string;
  memo: string;
  createdAt: string;
  isPublic?: boolean;
  userId?: string;
  userName?: string;
}

interface SharedHighlightsListProps {
  sharedHighlights: Highlight[];
  users: User[];
}

const SharedHighlightsList: React.FC<SharedHighlightsListProps> = ({
  sharedHighlights,
  users,
}) => {
  // 공유된 하이라이트가 없는 경우 메시지 표시
  if (sharedHighlights.length === 0) {
    return (
      <div
        style={{
          marginTop: '20px',
          border: '1px solid #ddd',
          padding: '10px',
        }}>
        <h3>공유된 하이라이트 목록</h3>
        <p>현재 공유된 하이라이트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '20px',
        border: '1px solid #ddd',
        padding: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
      <h3>공유된 하이라이트 목록</h3>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {sharedHighlights.map(highlight => {
          // 해당 사용자 정보 찾기
          const user = users.find(u => u.id === highlight.userId);

          return (
            <li
              key={highlight.id}
              style={{
                padding: '8px',
                margin: '5px 0',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                borderLeft: `4px solid ${highlight.color}`,
                borderRight: user ? `4px solid ${user.color}` : 'none',
              }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                <div style={{ flex: 1 }}>
                  {/* 하이라이트 텍스트 */}
                  <div style={{ fontWeight: 'bold' }}>{highlight.text}</div>

                  {/* 메모가 있는 경우 표시 */}
                  {highlight.memo && (
                    <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                      <strong>메모:</strong> {highlight.memo}
                    </div>
                  )}

                  {/* 사용자 정보와 생성 날짜 표시 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.8em',
                      color: '#666',
                      marginTop: '5px',
                    }}>
                    {user && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          marginRight: '5px',
                          border: `1px solid ${user.color}`,
                        }}
                      />
                    )}
                    <span style={{ color: user ? user.color : 'inherit' }}>
                      {highlight.userName || '알 수 없는 사용자'}
                    </span>
                    <span style={{ margin: '0 5px' }}>•</span>
                    <span>
                      {new Date(highlight.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SharedHighlightsList;
