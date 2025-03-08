import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import UserSelector from '@/components/UserSelector';
import { User } from '@/types';

const UserSelectorPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  // 사용자 선택 확인 함수
  const confirmUserSelection = () => {
    if (selectedUser) {
      localStorage.setItem('selectedUserId', selectedUser.id);
      navigate('/reader');
    }
  };

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <UserSelector
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.id}
        />
        <ButtonContainer>
          <SelectButton
            onClick={confirmUserSelection}
            disabled={!selectedUser}
            $isActive={!!selectedUser}>
            선택 완료
          </SelectButton>
        </ButtonContainer>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default UserSelectorPage;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const SelectButton = styled.button<{ $isActive: boolean }>`
  padding: 10px 20px;
  background-color: ${props => (props.$isActive ? '#4285F4' : '#ccc')};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: ${props => (props.$isActive ? 'pointer' : 'not-allowed')};
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => (props.$isActive ? '#3b77db' : '#ccc')};
  }
`;
