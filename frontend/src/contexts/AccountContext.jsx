import React, { createContext, useState, useEffect, useContext } from 'react'
import { auth } from '../api/api' // импортируем ваши API функции

// Создаем контекст
const AccountContext = createContext({
   isLogin: false,
   token: null,
   account: null,
   onLogin: () => {},
   onLogout: () => {},
   loading: true, // добавим состояние загрузки
})

// Кастомный хук для удобного использования контекста
export const useAccount = () => {
   const context = useContext(AccountContext)
   if (!context) {
      throw new Error('useAccount must be used within AccountProvider')
   }
   return context
}

// Провайдер, который будет оборачивать всё приложение
export const AccountProvider = ({ children }) => {
   const [isLogin, setIsLogin] = useState(false)
   const [token, setToken] = useState(null)
   const [account, setAccount] = useState(null)
   const [loading, setLoading] = useState(true)

   // Функция входа
   const onLogin = (newToken, userData) => {
      setToken(newToken)
      setAccount(userData)
      setIsLogin(true)
      localStorage.setItem('token', newToken)
   }

   // Функция выхода
   const onLogout = () => {
      setToken(null)
      setAccount(null)
      setIsLogin(false)
      localStorage.removeItem('token')
      auth.logout() // используем вашу существующую функцию
   }

   // При загрузке приложения проверяем, есть ли токен
   useEffect(() => {
      const checkAuth = async () => {
         const savedToken = localStorage.getItem('token')

         if (savedToken) {
            try {
               // Пробуем получить данные пользователя
               const userData = await auth.me()
               onLogin(savedToken, userData)
            } catch (error) {
               // Если токен невалидный - очищаем
               console.error('Token validation failed:', error)
               onLogout()
            }
         }

         setLoading(false)
      }

      checkAuth()
   }, [])

   const value = {
      isLogin,
      token,
      account,
      onLogin,
      onLogout,
      loading,
   }

   return (
      <AccountContext.Provider value={value}>
         {children}
      </AccountContext.Provider>
   )
}

export default AccountContext
