import React from 'react';
import styled from 'styled-components';

export default function Footer() {
  return (
    <FooterContainer>
      <Copyright>© 2025 Bookiwi - 프로토타입 버전</Copyright>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #666;
  font-size: 0.8rem;
`;

const Copyright = styled.p`
  margin: 0;
`;
