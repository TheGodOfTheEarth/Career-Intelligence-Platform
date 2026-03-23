// components/ProtectedRoute.tsx
import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from '../contexts/AccountContext'
import Loader from './Loader'

interface ProtectedRouteProps {
   children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
   const { isLogin, loading } = useAccount()

   if (loading) {
      return <Loader />
   }

   if (!isLogin) {
      return <Navigate to="/" replace />
   }

   return <>{children}</>
}

export default ProtectedRoute
