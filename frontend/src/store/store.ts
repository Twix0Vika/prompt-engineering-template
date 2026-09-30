import { configureStore } from '@reduxjs/toolkit'
import appReducer from '@/store/slices/appSlice'
import authReducer from '@features/auth/frontend/api/authSlice'
import { authApi } from '@features/auth/frontend/api/authApi'
import { capsulesApi } from '@features/capsules/frontend/api/capsulesApi'

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [capsulesApi.reducerPath]: capsulesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(capsulesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
