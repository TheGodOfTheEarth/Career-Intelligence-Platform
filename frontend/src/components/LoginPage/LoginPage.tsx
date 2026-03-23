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
               <h3>Вход</h3>
               <p>Введите логин и пароль</p>

               <div className="inputGroup">
                  <input
                     type="text"
                     required
                     value={login}
                     onChange={(e) => setLogin(e.target.value)}
                  />
               </div>

               <div className="inputGroup">
                  <input
                     type="password"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />
               </div>

               {error && <p style={{ color: 'red' }}>{error}</p>}
               <div className="buttonWrapper">
                  <button onClick={handleLogin} className="buttonLogIn">
                     Войти
                  </button>
               </div>
            </div>
            <div className="loginTexts">
               <p>С возвращением!</p>
               <p>
                  Покорояйте вершины вашей карьеры с<br />
                  Career Intelligence Platform
               </p>
            </div>
         </div>
      </div>
   )
}

export default LoginPage
