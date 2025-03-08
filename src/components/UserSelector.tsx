import { User } from '@/types';
import React from 'react';
import styled from 'styled-components';

export interface UserSelectorProps {
  onSelectUser?: (user: User) => void;
  selectedUserId?: string | null;
}

// 프로토타입용 가상 사용자 데이터
export const USERS: User[] = [
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

// UserSelector 컴포넌트 정의
const UserSelector: React.FC<UserSelectorProps> = ({
  onSelectUser,
  selectedUserId,
}) => {
  const handleSelectUser = (user: User) => {
    if (onSelectUser) {
      onSelectUser(user);
    } else {
      console.log('Selected user:', user);
    }
  };

  return (
    <Container>
      <Title>사용자 프로필 선택</Title>
      <Description>
        하이라이트를 공유하기 위해 사용할 프로필을 선택하세요.
      </Description>

      <UserCardsContainer>
        {USERS.map(user => (
          <UserCard
            key={user.id}
            $isSelected={user.id === selectedUserId}
            $color={user.color}
            onClick={() => handleSelectUser(user)}>
            <UserAvatar src={user.avatar} alt={user.name} $color={user.color} />
            <UserName $color={user.color}>{user.name}</UserName>
          </UserCard>
        ))}
      </UserCardsContainer>
    </Container>
  );
};

export default UserSelector;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const Description = styled.p`
  margin-bottom: 20px;
  text-align: center;
`;

const UserCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
`;

const UserCard = styled.div<{ $isSelected: boolean; $color: string }>`
  cursor: pointer;
  border: ${props =>
    props.$isSelected ? `3px solid ${props.$color}` : '1px solid #ddd'};
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  box-shadow: ${props =>
    props.$isSelected ? `0 0 10px ${props.$color}40` : 'none'};
  transition: all 0.2s ease;
`;

const UserAvatar = styled.img<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: ${props => `2px solid ${props.$color}`};
`;

const UserName = styled.div<{ $color: string }>`
  font-weight: bold;
  color: ${props => props.$color};
`;
