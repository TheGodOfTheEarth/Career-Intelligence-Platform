// src/contexts/AccountContext.tsx
import React, {
   createContext,
   useState,
   useEffect,
   useContext,
   ReactNode,
} from 'react'
import { auth } from '../api/api'

export interface User {
   id: string | number
   name?: string
   email: string
   createdAt?: string
   updatedAt?: string
   [key: string]: any
}

export interface AccountContextInterface {
   isLogin: boolean
   token: string | null
   account: User | null
   loading: boolean
   onLogin: (token: string, userData: User) => void
   onLogout: () => void
}

const AccountContext = createContext<AccountContextInterface | undefined>(
   undefined,
)

export const useAccount = (): AccountContextInterface => {
   const context = useContext(AccountContext)
   if (!context) {
      throw new Error('useAccount must be used within AccountProvider')
   }
   return context
}

interface AccountProviderProps {
   children: ReactNode
}

export const AccountProvider: React.FC<AccountProviderProps> = ({
   children,
}) => {
   const [isLogin, setIsLogin] = useState<boolean>(false)
   const [token, setToken] = useState<string | null>(null)
   const [account, setAccount] = useState<User | null>(null)
   const [loading, setLoading] = useState<boolean>(true)

   const onLogin = (newToken: string, userData: User): void => {
      setToken(newToken)
      setAccount(userData)
      setIsLogin(true)
      localStorage.setItem('token', newToken)
   }

   const onLogout = (): void => {
      setToken(null)
      setAccount(null)
      setIsLogin(false)
      localStorage.removeItem('token')
      auth.logout()
   }

   useEffect(() => {
      const checkAuth = async (): Promise<void> => {
         const savedToken = localStorage.getItem('token')

         if (savedToken) {
            try {
               const userData = await auth.me()
               onLogin(savedToken, userData)
            } catch (error) {
               console.error('Token validation failed:', error)
               onLogout()
            }
         }

         setLoading(false)
      }

      checkAuth()
   }, [])

   const value: AccountContextInterface = {
      isLogin,
      token,
      account,
      loading,
      onLogin,
      onLogout,
   }

   return (
      <AccountContext.Provider value={value}>
         {children}
      </AccountContext.Provider>
   )
}

export default AccountContext
