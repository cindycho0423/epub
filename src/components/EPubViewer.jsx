import Epub from 'epubjs';
import React, { useEffect, useRef, useState } from 'react';

const EPubViewer = ({ url }) => {
  // rendition 객체와 book 객체를 저장할 ref 생성
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로딩 상태 설정
    setIsLoading(true);
    setError(null);

    // 이미 로드된 책이 있으면 해제
    if (bookRef.current) {
      bookRef.current.destroy();
    }

    try {
      // EPUB 책 인스턴스 생성
      const book = Epub(url);
      bookRef.current = book;

      // EPUB 로드 시 에러 핸들링
      book.ready.catch(error => {
        console.error('EPUB 로드 오류:', error);
        setError('EPUB 파일을 로드하는 중 오류가 발생했습니다.');
        setIsLoading(false);
      });

      // 책이 로드되었을 때 총 페이지 수 계산 시도
      book.loaded.navigation
        .then(() => {
          if (book.navigation && book.navigation.toc) {
            setTotalPages(book.navigation.toc.length);
          }
        })
        .catch(error => {
          console.error('목차 로드 오류:', error);
        });

      // 'area' ID를 가진 요소에 EPUB 렌더링
      const rendition = book.renderTo('area', {
        width: '100%',
        height: '100%',
        spread: 'none', // 단일 페이지 보기 설정
        flow: 'paginated', // 페이지 방식으로 표시
        minSpreadWidth: 800, // 작은 화면에서도 한 페이지만 표시
        // ResizeObserver 관련 옵션 제거
        resizeOnOrientationChange: false, // 화면 회전 시 자동 리사이즈 비활성화
      });

      renditionRef.current = rendition;

      // 페이지 변경 이벤트 감지
      rendition.on('relocated', location => {
        if (location && location.start) {
          setCurrentPage(location.start.displayed.page || 0);
        }
      });

      // EPUB 표시
      rendition
        .display()
        .then(() => {
          setIsLoading(false);
        })
        .catch(error => {
          console.error('EPUB 렌더링 오류:', error);
          setError('EPUB 파일을 표시하는 중 오류가 발생했습니다.');
          setIsLoading(false);
        });

      // 키보드 이벤트 핸들러 등록
      const keyListener = e => {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      };

      document.addEventListener('keyup', keyListener);

      // 컴포넌트 언마운트 시 정리 작업
      return () => {
        document.removeEventListener('keyup', keyListener);

        if (bookRef.current) {
          bookRef.current.destroy();
        }
      };
    } catch (error) {
      console.error('EPUB 초기화 오류:', error);
      setError('EPUB 뷰어를 초기화하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, [url]); // url이 변경될 때마다 useEffect 실행

  // 이전 페이지로 이동하는 함수
  const handlePrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev().catch(error => {
        console.error('이전 페이지 이동 오류:', error);
      });
    }
  };

  // 다음 페이지로 이동하는 함수
  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next().catch(error => {
        console.error('다음 페이지 이동 오류:', error);
      });
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
          disabled={isLoading || !!error}
          style={{ margin: '0 5px', padding: '5px 10px' }}>
          이전 페이지
        </button>

        {/* 페이지 정보 표시 */}
        <div
          style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>
          {isLoading
            ? '로딩 중...'
            : error
            ? '오류 발생'
            : currentPage > 0
            ? `${currentPage} / ${totalPages || '?'}`
            : '준비 중'}
        </div>

        {/* 다음 페이지 버튼 */}
        <button
          onClick={handleNext}
          disabled={isLoading || !!error}
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
          position: 'relative',
        }}>
        {/* 로딩 표시기 */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}>
            <div>EPUB 파일 로딩 중...</div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 200, 200, 0.7)',
              zIndex: 10,
            }}>
            <div>{error}</div>
          </div>
        )}

        {/* EPUB이 렌더링될 영역 */}
        <div id='area' style={{ width: '100%', height: '100%' }}></div>
      </div>
    </>
  );
};

export default EPubViewer;
