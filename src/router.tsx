import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { BoardListPage } from './pages/BoardListPage'
import { BoardPage } from './pages/BoardPage'
import { InviteEntryPage } from './pages/InviteEntryPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/boards', element: <BoardListPage /> },
  { path: '/board/:boardId', element: <BoardPage /> },
  { path: '/invite/:token', element: <InviteEntryPage /> },
  { path: '*', element: <NotFoundPage /> },
])
