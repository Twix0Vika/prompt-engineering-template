import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthPage } from '@features/auth/frontend/pages/AuthPage'
import { ProtectedRoute } from '@features/auth/frontend/components/ProtectedRoute'
import { DashboardPage } from '@features/capsules/frontend/pages/DashboardPage'
import { CapsuleEditorPage } from '@features/capsules/frontend/pages/CapsuleEditorPage'
import { CapsuleViewPage } from '@features/capsules/frontend/pages/CapsuleViewPage'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<AuthPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CapsuleEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <CapsuleEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/capsule/:id"
            element={
              <ProtectedRoute>
                <CapsuleViewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
