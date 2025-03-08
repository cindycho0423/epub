import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import EPubViewer from '@/components/EPubViewer';
import { USERS } from '@/components/UserSelector';
import { User } from '@/types';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

export const ReaderPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [bookId] = useState('sample_book_1');

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const savedUserId = localStorage.getItem('selectedUserId');
    if (savedUserId) {
      const user = USERS.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
    // 로딩 상태를 false로 변경하여 체크가 완료되었음을 표시
    setIsLoading(false);
  }, []);

  const changeUser = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return <LoadingText>로딩 중...</LoadingText>;
  }

  if (!currentUser) {
    console.log('사용자 정보가 없어 리다이렉트합니다');
    return <Navigate to='/' />;
  }

  return (
    <ReaderContainer>
      <Header />
      {currentUser && (
        <UserBar color={currentUser.color}>
          <UserAvatar
            src={currentUser.avatar}
            alt={currentUser.name}
            borderColor={currentUser.color}
          />
          <UserName>{currentUser.name}</UserName>
          <ChangeUserButton onClick={changeUser}>사용자 변경</ChangeUserButton>
        </UserBar>
      )}
      <EPubViewer
        url='../epub_sample.epub'
        bookId={bookId}
        currentUser={currentUser}
      />
      <Footer />
    </ReaderContainer>
  );
};

const ReaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const UserBar = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${props => props.color + '20'}; // 투명도 추가
  border-bottom: 2px solid ${props => props.color};
`;

const UserAvatar = styled.img<{ borderColor: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid ${props => props.borderColor};
`;

const UserName = styled.span`
  font-weight: bold;
  flex-grow: 1;
`;

const ChangeUserButton = styled.button`
  padding: 5px 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background-color: #3b77db;
  }
`;

const LoadingText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
`;
