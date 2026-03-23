export interface User {
   id: string | number
   name?: string
   email: string
   createdAt?: string
   updatedAt?: string
   [key: string]: any // для дополнительных полей пользователя
}

export interface AccountContextInterface {
   isLogin: boolean
   token: string | null
   account: User | null
   loading: boolean
   onLogin: (token: string, userData: User) => void
   onLogout: () => void
}
