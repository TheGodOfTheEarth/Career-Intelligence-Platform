import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../contexts/AccountContext'
import { auth } from '../../api/api'
import './Register.css'

function RegisterPage() {
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { onLogin } = useAccount()

  useEffect(() => {
    document.title = 'Регистрация — CarIP'
  }, [])

  const handleRegister = async () => {
    setError('')
    console.log('=== НАЧАЛО РЕГИСТРАЦИИ ===')
    console.log('Данные для регистрации:', {
      name,
      email: login,
      password: '***',
    })

    try {
      console.log('Отправка запроса на сервер...')
      const response = await auth.register({ name, email: login, password })

      console.log('Ответ от сервера:', response)
      console.log('Тип ответа:', typeof response)
      console.log('Ключи в ответе:', Object.keys(response))

      const { token, user } = response
      console.log('Token:', token ? 'получен' : 'НЕТ ТОКЕНА')
      console.log('User:', user)

      if (!token) {
        console.error('Токен отсутствует в ответе!')
        throw new Error('Сервер не вернул токен')
      }

      onLogin(token, user)
      console.log('Регистрация успешна, перенаправление на /main')
      navigate('/main')
    } catch (error: any) {
      console.error('=== ОШИБКА РЕГИСТРАЦИИ ===')
      console.error('Объект ошибки:', error)
      console.error('Сообщение ошибки:', error.message)
      console.error('Статус ошибки:', error.status)
      console.error('Полный объект ошибки:', JSON.stringify(error, null, 2))

      setError(error.message || 'Ошибка регистрации')
    }
  }

  return (
    <div className="loginPage">
      <div className="logniPageWrapper">
        <div className="panel">
          <div className="panel-brand">
            <div className="panel-brand-name">Car<span>IP</span></div>
          </div>
          <h3>Регистрация</h3>
          <p>Создайте аккаунт, чтобы начать</p>

          <div className="inputGroup">
            <label>Имя пользователя</label>
            <input
              type="text"
              placeholder="Иван Иванов"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0 }}>
              {error}
            </p>
          )}

          <div className="buttonWrapper">
            <button onClick={handleRegister} className="buttonLogIn">
              Зарегистрироваться
            </button>
          </div>

          <div className="authLink">
            Уже есть аккаунт?{' '}
            <span onClick={() => navigate('/login')}>Войти</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
