import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import './App.css';
import UserSelectorPage from './pages/UserSelector';
import { ReaderPage } from './pages/Reader';

// 미래 플래그를 활성화한 router 생성
const router = createBrowserRouter([
  {
    path: '/',
    element: <UserSelectorPage />,
  },
  {
    path: '/reader',
    element: <ReaderPage />,
  },
  {
    path: '*',
    element: <Navigate to='/' />,
  },
]);

function App() {
  return (
    <RouterProvider
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
      router={router}
    />
  );
}

export default App;
