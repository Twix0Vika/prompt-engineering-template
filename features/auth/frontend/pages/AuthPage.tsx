import { useState } from 'react'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login to TimeCapsule' : 'Create an Account'}</h1>
        
        {isLogin ? <LoginForm /> : <RegisterForm />}
        
        <div className="mt-4 text-center">
          <button 
            className="text-blue-500 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
