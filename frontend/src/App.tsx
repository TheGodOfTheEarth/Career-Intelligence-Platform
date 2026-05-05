import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AccountProvider } from './contexts/AccountContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import HiPage from './components/HiPage/HiPage'
import LoginPage from './components/LoginPage/LoginPage'
import RegisterPage from './components/RegisterPage/RegisterPage'
import MainPage from './components/MainPage/MainPage'
import ResumeEditor from './components/ResumeEditor/ResumeEditor'

function App() {
   return (
      <AccountProvider>
         <BrowserRouter>
            <Routes>
               <Route
                  path="/"
                  element={
                     <PublicRoute>
                        <HiPage />
                     </PublicRoute>
                  }
               />
               <Route
                  path="/login"
                  element={
                     <PublicRoute>
                        <LoginPage />
                     </PublicRoute>
                  }
               />
               <Route
                  path="/register"
                  element={
                     <PublicRoute>
                        <RegisterPage />
                     </PublicRoute>
                  }
               />
               <Route
                  path="/main"
                  element={
                     <ProtectedRoute>
                        <MainPage />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/resume/:id"
                  element={
                     <ProtectedRoute>
                        <ResumeEditor />
                     </ProtectedRoute>
                  }
               />
            </Routes>
         </BrowserRouter>
      </AccountProvider>
   )
}

export default App
