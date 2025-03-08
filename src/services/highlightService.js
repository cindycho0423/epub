// src/services/highlightService.js

import { FIREBASE_DB } from '../utils/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// 하이라이트 저장하기
export const saveHighlight = async (bookId, highlight, userId, userName) => {
  console.log('하이라이트 저장 시작...', {
    bookId,
    highlight,
    userId,
    userName,
  });

  try {
    const highlightData = {
      bookId,
      userId,
      userName,
      text: highlight.text,
      cfi: highlight.cfi,
      color: highlight.color,
      memo: highlight.memo || '',
      createdAt: serverTimestamp(),
      isPublic: false,
    };

    console.log('Firestore에 저장할 데이터:', highlightData);
    console.log('Firestore 컬렉션 참조 생성 시도...');

    const highlightsCollection = collection(FIREBASE_DB, 'highlights');
    console.log('컬렉션 참조 생성됨:', highlightsCollection);

    console.log('문서 추가 시도...');
    const docRef = await addDoc(highlightsCollection, highlightData);
    console.log('문서 추가 성공! ID:', docRef.id);

    return {
      id: docRef.id,
      ...highlightData,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('하이라이트 저장 오류 상세:', error);
    console.error('오류 타입:', error.name);
    console.error('오류 메시지:', error.message);
    console.error('오류 코드:', error.code);
    throw error;
  }
};

// 하이라이트 업데이트하기 (메모 수정 등)
export const updateHighlight = async (highlightId, updatedData) => {
  try {
    const highlightRef = doc(FIREBASE_DB, 'highlights', highlightId);
    await updateDoc(highlightRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('하이라이트 업데이트 오류:', error);
    throw error;
  }
};

// 하이라이트 삭제하기
export const deleteHighlight = async highlightId => {
  try {
    await deleteDoc(doc(FIREBASE_DB, 'highlights', highlightId));
    return true;
  } catch (error) {
    console.error('하이라이트 삭제 오류:', error);
    throw error;
  }
};

// 특정 책의 내 하이라이트 불러오기
export const getMyHighlights = async (bookId, userId) => {
  try {
    const q = query(
      collection(FIREBASE_DB, 'highlights'),
      where('bookId', '==', bookId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const highlights = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      highlights.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    return highlights;
  } catch (error) {
    console.error('하이라이트 불러오기 오류:', error);
    throw error;
  }
};

// 하이라이트 공유하기 (전체 공개)
export const shareHighlight = async highlightId => {
  try {
    // 하이라이트를 공개로 설정
    const highlightRef = doc(FIREBASE_DB, 'highlights', highlightId);
    await updateDoc(highlightRef, { isPublic: true });
    return true;
  } catch (error) {
    console.error('하이라이트 공유 오류:', error);
    throw error;
  }
};

// 하이라이트 공유 취소하기
export const cancelShareHighlight = async highlightId => {
  try {
    // 하이라이트를 비공개로 설정
    const highlightRef = doc(FIREBASE_DB, 'highlights', highlightId);
    await updateDoc(highlightRef, { isPublic: false });
    return true;
  } catch (error) {
    console.error('하이라이트 공유 취소 오류:', error);
    throw error;
  }
};

// 공유된 하이라이트 불러오기 (특정 사용자의 것 제외)
export const getSharedHighlights = async (bookId, currentUserId) => {
  try {
    // 공개된 다른 사용자의 하이라이트 찾기
    const q = query(
      collection(FIREBASE_DB, 'highlights'),
      where('bookId', '==', bookId),
      where('isPublic', '==', true),
      where('userId', '!=', currentUserId)
    );

    const querySnapshot = await getDocs(q);
    const sharedHighlights = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      sharedHighlights.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    return sharedHighlights;
  } catch (error) {
    console.error('공유 하이라이트 불러오기 오류:', error);
    throw error;
  }
};

// 모든 사용자의 공유된 하이라이트 불러오기 (관리자 기능)
export const getAllSharedHighlights = async bookId => {
  try {
    const q = query(
      collection(FIREBASE_DB, 'highlights'),
      where('bookId', '==', bookId),
      where('isPublic', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const sharedHighlights = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      sharedHighlights.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    return sharedHighlights;
  } catch (error) {
    console.error('모든 공유 하이라이트 불러오기 오류:', error);
    throw error;
  }
};
