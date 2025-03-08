// src/components/EPubViewer.jsx

import Epub from 'epubjs';
import React, { useEffect, useRef, useState } from 'react';
import {
  saveHighlight,
  updateHighlight,
  deleteHighlight,
  getMyHighlights,
  getSharedHighlights,
  shareHighlight,
  cancelShareHighlight,
} from '../services/highlightService';
import { USERS } from './UserSelector';

const EPubViewer = ({ url, bookId, currentUser }) => {
  // rendition 객체와 book 객체를 저장할 ref 생성
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 하이라이트 관련 상태 관리
  const [highlights, setHighlights] = useState([]);
  const [sharedHighlights, setSharedHighlights] = useState([]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [memoText, setMemoText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffff00'); // 기본 노란색

  // 목차 관련 상태 관리
  const [toc, setToc] = useState([]);
  const [isTocVisible, setIsTocVisible] = useState(false);

  // 공유 상태 관리
  const [isShowingSharedHighlights, setIsShowingSharedHighlights] =
    useState(true);

  // 사용 가능한 하이라이트 색상 목록
  const highlightColors = [
    { id: 'yellow', color: '#ffff00', name: '노랑' },
    { id: 'green', color: '#90ee90', name: '초록' },
    { id: 'blue', color: '#add8e6', name: '파랑' },
    { id: 'pink', color: '#ffb6c1', name: '분홍' },
    { id: 'orange', color: '#ffa500', name: '주황' },
  ];

  // 하이라이트 불러오기
  useEffect(() => {
    const loadHighlights = async () => {
      if (currentUser && bookId) {
        try {
          setIsLoading(true);

          // 내 하이라이트 불러오기
          const myHighlights = await getMyHighlights(bookId, currentUser.id);
          setHighlights(myHighlights);

          // 공유된 하이라이트 불러오기
          const shared = await getSharedHighlights(bookId, currentUser.id);
          setSharedHighlights(shared);

          setIsLoading(false);
        } catch (error) {
          console.error('하이라이트 불러오기 오류:', error);
          setIsLoading(false);
        }
      }
    };

    loadHighlights();
  }, [currentUser, bookId]);

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

      // 책이 로드되었을 때 총 페이지 수 계산 및 목차 로드
      book.loaded.navigation
        .then(() => {
          if (book.navigation && book.navigation.toc) {
            setTotalPages(book.navigation.toc.length);
            setToc(book.navigation.toc);
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

          // 페이지가 바뀔 때 해당 페이지의 하이라이트 적용
          applyHighlightsToCurrentPage();
        }
      });

      // 선택 이벤트 리스너 추가
      rendition.on('selected', (cfiRange, contents) => {
        if (isHighlightMode && currentUser) {
          // 선택한 텍스트 가져오기
          const text = contents.window.getSelection().toString();

          if (text && text.trim() !== '') {
            // 로컬 하이라이트 객체 생성
            const newHighlight = {
              text: text.trim(),
              cfi: cfiRange,
              color: selectedColor,
              memo: '',
              createdAt: new Date().toISOString(),
            };

            // Firestore에 하이라이트 저장
            saveHighlight(
              bookId,
              newHighlight,
              currentUser.id,
              currentUser.name
            )
              .then(savedHighlight => {
                // 저장된 하이라이트 정보로 상태 업데이트
                setHighlights(prev => [...prev, savedHighlight]);

                // 화면에 하이라이트 적용
                applyHighlightToScreen(savedHighlight);
              })
              .catch(error => {
                console.error('하이라이트 저장 오류:', error);
              });

            // 선택 초기화
            contents.window.getSelection().removeAllRanges();
          }
        }
      });

      // EPUB 표시
      rendition
        .display()
        .then(() => {
          setIsLoading(false);
          // 페이지가 로드되면 하이라이트 적용
          applyHighlightsToCurrentPage();
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
  }, [url, isHighlightMode, bookId, currentUser, selectedColor]);

  // 하이라이트를 화면에 적용하는 함수
  const applyHighlightToScreen = highlight => {
    if (!renditionRef.current) return;

    try {
      // 색상 정보를 포함하여 하이라이트 적용
      renditionRef.current.annotations.highlight(
        highlight.cfi,
        {},
        e => {
          // 하이라이트 클릭 시 해당 하이라이트 선택
          setSelectedHighlight(highlight);
          setMemoText(highlight.memo || '');
        },
        undefined,
        {
          fill: highlight.color,
          'fill-opacity': '0.5',
        }
      );
    } catch (error) {
      console.error('하이라이트 적용 오류:', error);
    }
  };

  // 공유된 하이라이트를 화면에 적용하는 함수
  const applySharedHighlightToScreen = highlight => {
    if (!renditionRef.current) return;

    try {
      // 다른 사용자의 하이라이트는 테두리를 추가하여 구분
      const userColor =
        USERS.find(user => user.id === highlight.userId)?.color || '#000000';

      renditionRef.current.annotations.highlight(
        highlight.cfi,
        {},
        e => {
          // 공유된 하이라이트 클릭 시 정보 표시
          alert(
            `${highlight.userName}님의 하이라이트:\n${highlight.text}\n\n${
              highlight.memo ? `메모: ${highlight.memo}` : ''
            }`
          );
        },
        undefined,
        {
          fill: highlight.color,
          'fill-opacity': '0.3', // 공유 하이라이트는 더 투명하게
          stroke: userColor,
          'stroke-width': '1px',
        }
      );
    } catch (error) {
      console.error('공유 하이라이트 적용 오류:', error);
    }
  };

  // 현재 페이지에 모든 하이라이트 적용하는 함수
  const applyHighlightsToCurrentPage = () => {
    if (!renditionRef.current) return;

    // 내 하이라이트 적용
    highlights.forEach(highlight => {
      applyHighlightToScreen(highlight);
    });

    // 공유된 하이라이트 적용 (설정이 켜져 있을 때만)
    if (isShowingSharedHighlights) {
      sharedHighlights.forEach(highlight => {
        applySharedHighlightToScreen(highlight);
      });
    }
  };

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

  // 하이라이트 모드 토글 함수
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
  };

  // 목차 표시 토글 함수
  const toggleToc = () => {
    setIsTocVisible(!isTocVisible);
  };

  // 공유된 하이라이트 표시 토글 함수
  // 공유된 하이라이트 표시 토글 함수
  const toggleSharedHighlights = () => {
    const newState = !isShowingSharedHighlights;
    setIsShowingSharedHighlights(newState);

    // 토글 시 전체 하이라이트 다시 적용
    if (renditionRef.current) {
      try {
        // 먼저 현재 표시된 모든 하이라이트를 개별적으로 제거
        highlights.forEach(highlight => {
          try {
            renditionRef.current.annotations.remove(highlight.cfi, 'highlight');
          } catch (error) {
            console.error('하이라이트 제거 오류:', error);
          }
        });

        if (isShowingSharedHighlights) {
          sharedHighlights.forEach(highlight => {
            try {
              renditionRef.current.annotations.remove(
                highlight.cfi,
                'highlight'
              );
            } catch (error) {
              console.error('공유 하이라이트 제거 오류:', error);
            }
          });
        }

        // 내 하이라이트는 항상 다시 적용
        highlights.forEach(highlight => {
          applyHighlightToScreen(highlight);
        });

        // 설정에 따라 공유 하이라이트 적용
        if (newState) {
          sharedHighlights.forEach(highlight => {
            applySharedHighlightToScreen(highlight);
          });
        }
      } catch (error) {
        console.error('하이라이트 토글 중 오류 발생:', error);
      }
    }
  };

  // 목차 항목 클릭 처리 함수
  const handleTocItemClick = href => {
    if (renditionRef.current) {
      renditionRef.current.display(href).catch(error => {
        console.error('목차 이동 오류:', error);
      });

      // 모바일 환경에서는 목차 클릭 후 자동으로 목차를 닫기
      if (window.innerWidth < 768) {
        setIsTocVisible(false);
      }
    }
  };

  // 하이라이트 색상 변경 함수
  const changeHighlightColor = color => {
    setSelectedColor(color);
  };

  // 하이라이트 삭제 함수
  const removeHighlight = async id => {
    const highlightToRemove = highlights.find(h => h.id === id);

    if (highlightToRemove && renditionRef.current) {
      // 화면에서 하이라이트 제거
      try {
        renditionRef.current.annotations.remove(
          highlightToRemove.cfi,
          'highlight'
        );
      } catch (error) {
        console.error('하이라이트 제거 오류:', error);
      }

      // Firestore에서 하이라이트 삭제
      try {
        await deleteHighlight(id);
      } catch (error) {
        console.error('하이라이트 삭제 오류:', error);
      }

      // 상태에서 하이라이트 제거
      setHighlights(highlights.filter(h => h.id !== id));

      // 선택된 하이라이트가 삭제된 하이라이트면 선택 초기화
      if (selectedHighlight && selectedHighlight.id === id) {
        setSelectedHighlight(null);
        setMemoText('');
      }
    }
  };

  // 메모 저장 함수
  const saveMemo = async () => {
    if (selectedHighlight) {
      // 상태 업데이트
      const updatedHighlights = highlights.map(h =>
        h.id === selectedHighlight.id ? { ...h, memo: memoText } : h
      );

      setHighlights(updatedHighlights);
      setSelectedHighlight({ ...selectedHighlight, memo: memoText });

      // Firestore에 메모 업데이트
      try {
        await updateHighlight(selectedHighlight.id, { memo: memoText });
      } catch (error) {
        console.error('메모 업데이트 오류:', error);
      }
    }
  };

  // 메모 입력 취소 함수
  const cancelMemo = () => {
    setSelectedHighlight(null);
    setMemoText('');
  };

  // 모든 하이라이트 삭제 함수
  const clearAllHighlights = async () => {
    if (!window.confirm('모든 하이라이트를 삭제하시겠습니까?')) {
      return;
    }

    // 화면에서 모든 하이라이트 제거
    if (renditionRef.current) {
      renditionRef.current.annotations.clear();
    }

    // Firestore에서 모든 하이라이트 삭제
    const deletePromises = highlights.map(h => deleteHighlight(h.id));

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('하이라이트 일괄 삭제 오류:', error);
    }

    // 상태 초기화
    setHighlights([]);
    setSelectedHighlight(null);
    setMemoText('');

    // 공유 하이라이트는 다시 표시
    if (isShowingSharedHighlights) {
      sharedHighlights.forEach(highlight => {
        applySharedHighlightToScreen(highlight);
      });
    }
  };

  // 하이라이트 메모 변경 이벤트 핸들러
  const handleMemoChange = e => {
    setMemoText(e.target.value);
  };

  // 하이라이트 공유 토글 함수
  const toggleShareHighlight = async highlight => {
    try {
      if (highlight.isPublic) {
        // 공유 취소
        await cancelShareHighlight(highlight.id);

        // 상태 업데이트
        setHighlights(
          highlights.map(h =>
            h.id === highlight.id ? { ...h, isPublic: false } : h
          )
        );
      } else {
        // 공유 설정
        await shareHighlight(highlight.id);

        // 상태 업데이트
        setHighlights(
          highlights.map(h =>
            h.id === highlight.id ? { ...h, isPublic: true } : h
          )
        );
      }
    } catch (error) {
      console.error('하이라이트 공유 상태 변경 오류:', error);
    }
  };

  // 목차 컴포넌트 - 재귀적으로 중첩된 목차를 표시
  const TocItem = ({ item, level = 0 }) => (
    <li style={{ marginLeft: `${level * 15}px` }}>
      <div
        onClick={() => handleTocItemClick(item.href)}
        style={{
          padding: '8px',
          cursor: 'pointer',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          fontSize: level === 0 ? '1em' : '0.9em',
          backgroundColor: level === 0 ? '#f5f5f5' : 'transparent',
        }}>
        {item.label}
      </div>
      {item.subitems && item.subitems.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {item.subitems.map((subitem, i) => (
            <TocItem key={i} item={subitem} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* 목차 사이드바 */}
      <div
        style={{
          width: isTocVisible ? '250px' : '0',
          height: '100%',
          backgroundColor: '#fff',
          borderRight: '1px solid #ddd',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          boxShadow: isTocVisible ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
        }}>
        {isTocVisible && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <div
              style={{
                padding: '15px',
                borderBottom: '1px solid #ddd',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <span>목차</span>
              <button
                onClick={toggleToc}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                }}>
                ×
              </button>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {toc.map((item, i) => (
                <TocItem key={i} item={item} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          flex: 1,
          marginLeft: isTocVisible ? '250px' : '0',
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}>
        {/* 현재 사용자 표시 */}
        {currentUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: currentUser.color + '20', // 투명도 추가
              borderBottom: `2px solid ${currentUser.color}`,
            }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                marginRight: '10px',
                border: `1px solid ${currentUser.color}`,
              }}
            />
            <span style={{ fontWeight: 'bold' }}>
              {currentUser.name}로 읽는 중
            </span>
          </div>
        )}

        {/* 버튼 컨테이너 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '10px',
            padding: '10px',
            borderBottom: '1px solid #eee',
          }}>
          {/* 목차 토글 버튼 */}
          <button
            onClick={toggleToc}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: isTocVisible ? '#e0e0e0' : '#f0f0f0',
            }}>
            {isTocVisible ? '목차 닫기' : '목차 보기'}
          </button>

          {/* 이전 페이지 버튼 */}
          <button
            onClick={handlePrev}
            disabled={isLoading || !!error}
            style={{ margin: '5px', padding: '5px 10px' }}>
            이전 페이지
          </button>

          {/* 페이지 정보 표시 */}
          <div
            style={{
              margin: '5px 10px',
              display: 'flex',
              alignItems: 'center',
            }}>
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
            style={{ margin: '5px', padding: '5px 10px' }}>
            다음 페이지
          </button>

          {/* 하이라이트 모드 토글 버튼 */}
          <button
            onClick={toggleHighlightMode}
            disabled={isLoading || !!error || !currentUser}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: isHighlightMode ? selectedColor : '#f0f0f0',
            }}>
            {isHighlightMode ? '하이라이트 모드 켜짐' : '하이라이트 모드'}
          </button>

          {/* 공유 하이라이트 표시 토글 버튼 */}
          <button
            onClick={toggleSharedHighlights}
            disabled={isLoading || !!error}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: isShowingSharedHighlights
                ? '#4CAF50'
                : '#f0f0f0',
              color: isShowingSharedHighlights ? 'white' : 'black',
            }}>
            {isShowingSharedHighlights
              ? '공유 하이라이트 표시 중'
              : '공유 하이라이트 표시'}
          </button>

          {/* 모든 하이라이트 삭제 버튼 */}
          <button
            onClick={clearAllHighlights}
            disabled={isLoading || !!error || highlights.length === 0}
            style={{ margin: '5px', padding: '5px 10px' }}>
            하이라이트 모두 삭제
          </button>
        </div>

        {/* 하이라이트 모드가 켜져 있을 때만 색상 선택 UI 표시 */}
        {isHighlightMode && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '10px',
            }}>
            <div style={{ marginRight: '10px' }}>하이라이트 색상: </div>
            {highlightColors.map(colorOption => (
              <div
                key={colorOption.id}
                onClick={() => changeHighlightColor(colorOption.color)}
                style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: colorOption.color,
                  margin: '0 5px',
                  cursor: 'pointer',
                  border:
                    colorOption.color === selectedColor
                      ? '2px solid black'
                      : '1px solid #ddd',
                  borderRadius: '4px',
                }}
                title={colorOption.name}
              />
            ))}
          </div>
        )}

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

        {/* 메모 편집 UI */}
        {selectedHighlight && (
          <div
            style={{
              marginTop: '20px',
              border: `2px solid ${selectedHighlight.color}`,
              padding: '15px',
              borderRadius: '5px',
            }}>
            <h3>메모 추가</h3>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                선택한 텍스트:{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {selectedHighlight.text}
                </span>
              </div>
              <textarea
                value={memoText}
                onChange={handleMemoChange}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  marginBottom: '10px',
                  borderColor: '#ddd',
                }}
                placeholder='메모를 입력하세요...'
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelMemo}
                  style={{ marginRight: '10px', padding: '5px 10px' }}>
                  취소
                </button>
                <button
                  onClick={saveMemo}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                  }}>
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 하이라이트 목록 */}
        {highlights.length > 0 && (
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
                      <div style={{ fontWeight: 'bold' }}>{highlight.text}</div>
                      {highlight.memo && (
                        <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                          <strong>메모:</strong> {highlight.memo}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '0.8em',
                          color: '#666',
                          marginTop: '5px',
                        }}>
                        {new Date(highlight.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
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
        )}

        {/* 공유된 하이라이트 목록 */}
        {isShowingSharedHighlights && sharedHighlights.length > 0 && (
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
                const user = USERS.find(u => u.id === highlight.userId);

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
                        <div style={{ fontWeight: 'bold' }}>
                          {highlight.text}
                        </div>
                        {highlight.memo && (
                          <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                            <strong>메모:</strong> {highlight.memo}
                          </div>
                        )}
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
                          <span
                            style={{ color: user ? user.color : 'inherit' }}>
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
        )}
      </div>
    </div>
  );
};

export default EPubViewer;
