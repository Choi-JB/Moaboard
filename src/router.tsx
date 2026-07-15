import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { BoardListPage } from './pages/BoardListPage'
import { BoardPage } from './pages/BoardPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/boards', element: <BoardListPage /> },
  { path: '/board/:boardId', element: <BoardPage /> },
])
