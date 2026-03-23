// components/PublicRoute.tsx
import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from '../contexts/AccountContext'
import Loader from './Loader'

interface PublicRouteProps {
   children: ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
   const { isLogin, loading } = useAccount()

   if (loading) {
      return <Loader />
   }

   if (isLogin) {
      return <Navigate to="/main" replace />
   }

   return <>{children}</>
}

export default PublicRoute
