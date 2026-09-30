import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { devMockCredentials, isDevAuthBypassEnabled } from '../config'

interface AuthState {
  token: string | null
  user: {
    id: string
    email: string
  } | null
}

const initialState: AuthState = {
  token: isDevAuthBypassEnabled
    ? devMockCredentials.token
    : localStorage.getItem('token'),
  user: isDevAuthBypassEnabled ? devMockCredentials.user : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: any; token: string }>
    ) => {
      if (action.payload.user) state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
