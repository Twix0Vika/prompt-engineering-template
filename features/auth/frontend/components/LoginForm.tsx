import React, { useState } from 'react'
import { useLoginMutation } from '../api/authApi'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../api/authSlice'
import { useNavigate } from 'react-router-dom'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials({ token: result.access_token }))
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to log in', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border p-2 rounded" />
      <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded">
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500">Failed to login</p>}
    </form>
  )
}
