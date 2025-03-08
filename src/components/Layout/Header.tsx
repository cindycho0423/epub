import React from 'react';
import styled from 'styled-components';

interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface HeaderProps {
  currentUser?: User | null;
  onChangeUser?: () => void;
}

export default function Header({ currentUser, onChangeUser }: HeaderProps) {
  return (
    <HeaderContainer className='App-header'>
      <Title>Bookiwi</Title>

      {/* 선택된 사용자가 있는 경우 현재 사용자 표시 */}
      {currentUser && (
        <UserContainer bgColor={currentUser.color}>
          <UserAvatar
            src={currentUser.avatar}
            alt={currentUser.name}
            borderColor={currentUser.color}
          />
          <UserName>{currentUser.name}님으로 읽는 중</UserName>
          {onChangeUser && (
            <ChangeUserButton onClick={onChangeUser}>
              사용자 변경
            </ChangeUserButton>
          )}
        </UserContainer>
      )}
    </HeaderContainer>
  );
}

// 스타일드 컴포넌트 정의
const HeaderContainer = styled.header`
  /* App-header 클래스에 있던 스타일을 여기로 이동 */
`;

const Title = styled.h1`
  margin: 20px 0;
`;

const UserContainer = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  padding: 5px 15px;
  background-color: ${props => props.bgColor + '20'};
  border-radius: 20px;
  margin: 0 0 10px 0;
`;

const UserAvatar = styled.img<{ borderColor: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid ${props => props.borderColor};
`;

const UserName = styled.span`
  /* 필요한 스타일 추가 */
`;

const ChangeUserButton = styled.button`
  margin-left: 10px;
  background: none;
  border: none;
  color: #4285f4;
  cursor: pointer;
  font-size: 0.8em;
`;
