import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SearchPage } from './pages/Search'
import { PaperDetail } from './pages/PaperDetail'
import { PaperForm } from './pages/PaperForm'
import { MyPapers } from './pages/MyPapers'
import { RequestsPage } from './pages/Requests'
import { ReviewPage } from './pages/Review'
import { StatsPage } from './pages/Stats'
import { ChatPage } from './pages/Chat'
import { AdminPage } from './pages/Admin'
import { ProfilePage } from './pages/Profile'
import { RegisterPage } from './pages/Register'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <SearchPage /> },
        { path: '/papers/nuevo', element: <PaperForm /> },
        { path: '/papers/:id', element: <PaperDetail /> },
        { path: '/mis-papers', element: <MyPapers /> },
        { path: '/solicitudes', element: <RequestsPage /> },
        { path: '/revision', element: <ReviewPage /> },
        { path: '/estadisticas', element: <StatsPage /> },
        { path: '/chat', element: <ChatPage /> },
        { path: '/admin', element: <AdminPage /> },
        { path: '/perfil', element: <ProfilePage /> },
        { path: '/registro', element: <RegisterPage /> },
        { path: '*', element: <SearchPage /> },
      ],
    },
  ],
  // GitHub Pages sirve este repo bajo /vetsdb-poc/ (ver vite.config.ts `base`).
  // BASE_URL es '/vetsdb-poc/' en ese build y '/' en local dev, sin tocar nada aquí.
  { basename: import.meta.env.BASE_URL },
)

export default function App() {
  return <RouterProvider router={router} />
}
