import Epub from 'epubjs';
import React from 'react';
import { useEffect, useRef } from 'react';

const EPubViewer = ({ url }) => {
  // rendition 객체를 저장할 ref 생성
  const renditionRef = useRef(null);
  useEffect(() => {
    // EPUB 책 인스턴스 생성
    const book = Epub(url);

    // 'area' ID를 가진 요소에 EPUB 렌더링 (CSS 선택자 사용)
    const rendition = book.renderTo('area', { width: '100%', height: '100%' });

    // rendition 객체를 ref에 저장하여 컴포넌트 전체에서 접근 가능하게 함
    renditionRef.current = rendition;

    // EPUB 표시 (Promise를 반환하지만 여기서는 결과를 따로 처리하지 않음)
    rendition.display();

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      // 필요한 정리 작업이 있다면 여기에 추가
    };
  }, [url]); // url이 변경될 때마다 useEffect 실행

  // 이전 페이지로 이동하는 함수
  const handlePrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  // 다음 페이지로 이동하는 함수
  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  return (
    <>
      {/* 버튼 컨테이너 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
        }}>
        {/* 이전 페이지 버튼 */}
        <button
          onClick={handlePrev}
          style={{ margin: '0 5px', padding: '5px 10px' }}>
          이전 페이지
        </button>

        {/* 다음 페이지 버튼 */}
        <button
          onClick={handleNext}
          style={{ margin: '0 5px', padding: '5px 10px' }}>
          다음 페이지
        </button>
      </div>

      {/* EPUB 뷰어 컨테이너 */}
      <div
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
        {/* EPUB이 렌더링될 영역 */}
        <div id='area' style={{ width: '100%', height: '100%' }}></div>
      </div>
    </>
  );
};

export default EPubViewer;
