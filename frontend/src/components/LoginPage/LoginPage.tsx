import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../contexts/AccountContext'
import { auth } from '../../api/api'
import './LoginPage.css'

function LoginPage() {
   const [login, setLogin] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState('')

   const navigate = useNavigate()
   const { onLogin } = useAccount()

   const handleLogin = async () => {
      setError('')
      try {
         const response = await auth.login({ email: login, password })
         const { token, user } = response
         onLogin(token, user)
         navigate('/main')
      } catch (error: any) {
         setError(error.message || 'Неверный логин или пароль')
      }
   }

   return (
      <div className="loginPage">
         <div className="logniPageWrapper">
            <div className="panel">
               <div className="panel-brand">
                  <div className="panel-brand-name">Car<span>IP</span></div>
               </div>
               <h3>Вход</h3>
               <p>Введите логин и пароль для входа в систему</p>

               <div className="inputGroup">
                  <label>Логин или Email</label>
                  <input
                     type="text"
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
                     onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
               </div>

               {error && (
                  <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0 }}>
                     {error}
                  </p>
               )}

               <div className="buttonWrapper">
                  <button onClick={handleLogin} className="buttonLogIn">
                     Войти
                  </button>
               </div>

               <div className="authLink">
                  Нет аккаунта?{' '}
                  <span onClick={() => navigate('/register')}>
                     Зарегистрироваться
                  </span>
               </div>
            </div>
         </div>
      </div>
   )
}

export default LoginPage
