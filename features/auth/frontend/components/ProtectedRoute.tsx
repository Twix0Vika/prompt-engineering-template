import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { isDevAuthBypassEnabled } from '../config'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token)

  if (!token && !isDevAuthBypassEnabled) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
