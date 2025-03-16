import React from 'react';
import {
  shareHighlight,
  cancelShareHighlight,
} from '../services/highlightService';
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

interface MyHighlightsListProps {
  highlights: Highlight[];
  setSelectedHighlight: (highlight: Highlight) => void;
  setMemoText: (text: string) => void;
  removeHighlight: (id: string) => void;
  bookId: string;
  currentUser: User;
}

const MyHighlightsList: React.FC<MyHighlightsListProps> = ({
  highlights,
  setSelectedHighlight,
  setMemoText,
  removeHighlight,
  bookId,
  currentUser,
}) => {
  // 하이라이트 공유 토글 함수
  const toggleShareHighlight = async (highlight: Highlight) => {
    try {
      if (highlight.isPublic) {
        // 공유 취소
        await cancelShareHighlight(highlight.id);
      } else {
        // 공유 설정
        await shareHighlight(highlight.id);
      }
    } catch (error) {
      console.error('하이라이트 공유 상태 변경 오류:', error);
    }
  };

  // 하이라이트가 없는 경우 메시지 표시
  if (highlights.length === 0) {
    return null;
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
      <h3>내 하이라이트 목록</h3>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {highlights.map(highlight => (
          <li
            key={highlight.id}
            style={{
              padding: '8px',
              margin: '5px 0',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              borderLeft: `4px solid ${highlight.color}`,
            }}
            onClick={() => {
              setSelectedHighlight(highlight);
              setMemoText(highlight.memo || '');
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

                {/* 생성 날짜 표시 */}
                <div
                  style={{
                    fontSize: '0.8em',
                    color: '#666',
                    marginTop: '5px',
                  }}>
                  {new Date(highlight.createdAt).toLocaleString()}
                </div>
              </div>

              {/* 작업 버튼 영역 */}
              <div>
                {/* 공유 토글 버튼 */}
                <button
                  onClick={e => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    toggleShareHighlight(highlight);
                  }}
                  style={{
                    marginRight: '5px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: highlight.isPublic ? '#4CAF50' : '#4285F4',
                  }}>
                  {highlight.isPublic ? '공유 중' : '공유하기'}
                </button>

                {/* 메모 버튼 */}
                <button
                  onClick={e => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    setSelectedHighlight(highlight);
                    setMemoText(highlight.memo || '');
                  }}
                  style={{
                    marginRight: '5px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#4285F4',
                  }}>
                  메모
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={e => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    removeHighlight(highlight.id);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'red',
                  }}>
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyHighlightsList;
