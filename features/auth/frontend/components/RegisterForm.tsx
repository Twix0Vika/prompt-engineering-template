import React, { useState } from 'react'
import { useRegisterMutation, useLoginMutation } from '../api/authApi'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../api/authSlice'
import { useNavigate } from 'react-router-dom'

export const RegisterForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [register, { isLoading, error }] = useRegisterMutation()
  const [login] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register({ email, password }).unwrap()
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials({ token: result.access_token }))
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to register', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border p-2 rounded" />
      <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="border p-2 rounded" />
      <button type="submit" disabled={isLoading} className="bg-green-500 text-white p-2 rounded">
        {isLoading ? 'Registering...' : 'Register'}
      </button>
      {error && <p className="text-red-500">Failed to register</p>}
    </form>
  )
}
