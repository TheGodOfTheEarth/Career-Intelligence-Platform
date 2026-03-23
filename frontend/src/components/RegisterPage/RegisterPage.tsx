import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RegisterPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = () => {
    if (login === 'lampochkat@bk.ru' && password === '123456') {
      // "Успешный вход"
      navigate('/main')
    } else {
      setError('Неверный логин или пароль')
    }
  }

  return (
    <div className="loginPage">
      <div className="logniPageWrapper">
        <div className="panel">
          <h3>Регистрация</h3>
          <p>Придумайте логин и пароль</p>

          <div className="inputGroup">
            <input
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            {/* <label>Логин</label> */}
          </div>

          <div className="inputGroup">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* <label>Пароль</label> */}
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="buttonWrapper">
            <button onClick={handleLogin} className="buttonLogIn">
              Зарегистрироваться
            </button>
          </div>
        </div>
        <div className="loginTexts">
          <p>Добро пожаловать!</p>
          <p>
            Покорояйте вершины вашей карьеры с<br />
            Career Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
