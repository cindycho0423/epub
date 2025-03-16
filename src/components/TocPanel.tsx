import React from 'react';
import styled from 'styled-components';

interface TocItemType {
  label: string;
  href: string;
  subitems?: TocItemType[];
}

interface TocItemProps {
  item: TocItemType;
  handleTocItemClick: (href: string) => void;
  level?: number;
}

interface TocPanelProps {
  toc: TocItemType[];
  isTocVisible: boolean;
  toggleToc: () => void;
  handleTocItemClick: (href: string) => void;
}

const TocItem: React.FC<TocItemProps> = ({
  item,
  handleTocItemClick,
  level = 0,
}) => (
  <TocListItem level={level}>
    <TocItemContent
      isRoot={level === 0}
      onClick={() => handleTocItemClick(item.href)}>
      {item.label}
    </TocItemContent>
    {item.subitems && item.subitems.length > 0 && (
      <SubitemsList>
        {item.subitems.map((subitem, i) => (
          <TocItem
            key={i}
            item={subitem}
            handleTocItemClick={handleTocItemClick}
            level={level + 1}
          />
        ))}
      </SubitemsList>
    )}
  </TocListItem>
);

// 목차 패널 컴포넌트
const TocPanel: React.FC<TocPanelProps> = ({
  toc,
  isTocVisible,
  toggleToc,
  handleTocItemClick,
}) => {
  return (
    <PanelContainer $isVisible={isTocVisible}>
      {isTocVisible && (
        <PanelContent>
          <PanelHeader>
            <span>목차</span>
            <CloseButton onClick={toggleToc}>×</CloseButton>
          </PanelHeader>
          <TocList>
            {toc.map((item, i) => (
              <TocItem
                key={i}
                item={item}
                handleTocItemClick={handleTocItemClick}
              />
            ))}
          </TocList>
        </PanelContent>
      )}
    </PanelContainer>
  );
};

export default TocPanel;

const PanelContainer = styled.div<{ $isVisible: boolean }>`
  width: ${props => (props.$isVisible ? '250px' : '0')};
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #ddd;
  overflow: hidden;
  transition: width 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  box-shadow: ${props =>
    props.$isVisible ? '2px 0 5px rgba(0,0,0,0.1)' : 'none'};
`;

const PanelContent = styled.div`
  height: 100%;
  overflow: auto;
`;

const PanelHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
`;

const TocList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const TocListItem = styled.li<{ level: number }>`
  margin-left: ${props => props.level * 15}px;
`;

const TocItemContent = styled.div<{ isRoot: boolean }>`
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  font-size: ${props => (props.isRoot ? '1em' : '0.9em')};
  background-color: ${props => (props.isRoot ? '#f5f5f5' : 'transparent')};

  &:hover {
    background-color: ${props => (props.isRoot ? '#e5e5e5' : '#f0f0f0')};
  }
`;

const SubitemsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;
