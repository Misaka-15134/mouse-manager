'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validatePassword = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister && !validatePassword()) {
        setLoading(false)
        return
      }

      const url = isRegister 
        ? '/api/auth/register' 
        : '/api/auth/login'
      
      const bodyData = isRegister 
        ? { email: formData.email, password: formData.password, name: formData.name } 
        : { email: formData.email, password: formData.password }
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      const data = await res.json()

      if (res.ok) {
        if (isRegister) {
          alert('注册成功！请登录您的账户')
          setIsRegister(false) // 切换到登录模式
          setFormData({ email: '', password: '', name: '', confirmPassword: '' })
        } else {
          // 登录成功，保存用户信息到 localStorage
          localStorage.setItem('user', JSON.stringify(data.user))
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        setError(data.error || (isRegister ? '注册失败' : '登录失败'))
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-blue-600">🐭</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isRegister ? '创建账户' : '登录小鼠管理系统'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? '填写以下信息创建新账户' : '输入您的邮箱和密码'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {isRegister && (
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transition-colors'
            }`}
          >
            {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegister ? '已有账户？' : '还没有账户？'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                setError('')
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              {isRegister ? '立即登录' : '立即注册'}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">测试账户：</p>
            <p>管理员: admin@lab.com / admin123</p>
            <p>实验员: user@lab.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  )
}