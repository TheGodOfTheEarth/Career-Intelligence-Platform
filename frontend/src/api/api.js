// Адрес бэкенда — локально или Railway
const API_URL = 'https://career-intelligence-platform-backend-production-040c.up.railway.app'

// ============================================
// Базовая функция для всех запросов
// Автоматически добавляет JWT токен к каждому запросу
// ============================================
async function refreshAccessToken() {
   const refreshToken = localStorage.getItem('refreshToken')
   if (!refreshToken) return false

   try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
         localStorage.removeItem('token')
         localStorage.removeItem('refreshToken')
         return false
      }

      const data = await response.json()
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return true
   } catch {
      return false
   }
}

async function apiRequest(endpoint, options = {}) {
   const token = localStorage.getItem('token')

   console.log(`=== API ЗАПРОС: ${endpoint} ===`)
   console.log('Метод:', options.method || 'GET')
   console.log('Тело запроса:', options.body)

   const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
         'Content-Type': 'application/json',
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
   })

   console.log('Статус ответа:', response.status)
   console.log('Заголовки ответа:', response.headers)

   if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
         const newToken = localStorage.getItem('token')
         const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${newToken}`,
            },
         })
         if (retryResponse.ok) {
            return retryResponse.json()
         }
      }
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      const error = new Error('Сессия истекла. Пожалуйста, войдите снова.')
      error.status = 401
      throw error
   }

   const data = await response.json()
   console.log('Данные ответа:', data)

   if (!response.ok) {
      console.error('Ошибка сервера:', data)
      throw new Error(data.error || 'Ошибка сервера')
   }

   return data
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================
export const auth = {
   // Регистрация — возвращает токены и данные пользователя
   register: async ({ name, email, password }) => {
      const data = await apiRequest('/api/auth/register', {
         method: 'POST',
         body: JSON.stringify({ name, email, password }),
      })
      if (data.accessToken) {
         localStorage.setItem('token', data.accessToken)
      }
      if (data.refreshToken) {
         localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data
   },

   // Вход — возвращает токены и данные пользователя
   login: async ({ email, password }) => {
      const data = await apiRequest('/api/auth/login', {
         method: 'POST',
         body: JSON.stringify({ email, password }),
      })
      if (data.accessToken) {
         localStorage.setItem('token', data.accessToken)
      }
      if (data.refreshToken) {
         localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data
   },

   // Выход — уведомляет бэкенд и удаляет оба токена
   logout: async () => {
      try {
         await apiRequest('/api/auth/logout', { method: 'POST' })
      } catch {}
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
   },

   // Проверить — залогинен ли пользователь
   isLoggedIn: () => !!localStorage.getItem('token'),

   // Получить данные о себе
   me: () => apiRequest('/api/auth/me'),
}

// ============================================
// ЧАТ С ИИ
// ============================================
export const chat = {
   createSession: (previousSessionId) =>
      apiRequest('/api/chat/session', {
         method: 'POST',
         body: JSON.stringify({ previousSessionId }),
      }),

   getSessions: (currentSessionId) =>
      apiRequest(
         `/api/chat/sessions${currentSessionId ? `?currentSessionId=${currentSessionId}` : ''}`,
      ),

   getSession: (sessionId) => apiRequest(`/api/chat/session/${sessionId}`),

   sendMessage: (sessionId, content) =>
      apiRequest(`/api/chat/session/${sessionId}/message`, {
         method: 'POST',
         body: JSON.stringify({ content }),
      }),

   deleteSession: (sessionId, currentSessionId) =>
      apiRequest(
         `/api/chat/session/${sessionId}${currentSessionId ? `?currentSessionId=${currentSessionId}` : ''}`,
         { method: 'DELETE' },
      ),
}

// ============================================
// РЕЗЮМЕ
// ============================================
export const resume = {
   // Все резюме пользователя
   getAll: () => apiRequest('/api/resume/my'),

   // Конкретное резюме
   getById: (id) => apiRequest(`/api/resume/${id}`),

   // Данные для генерации PDF
   getPdfData: (id) => apiRequest(`/api/resume/${id}/data-for-pdf`),
}

// ============================================
// GITHUB
// ============================================
export const github = {
   analyzeProfile: (username, resumeId) =>
      apiRequest('/api/github/analyze', {
         method: 'POST',
         body: JSON.stringify({ username, resumeId }),
      }),
}

// ============================================
// АНАЛИЗ
// ============================================
export const analysis = {
   getGapReport: (resumeId, refresh = false) =>
      apiRequest(`/api/resume/${resumeId}/gap-report${refresh ? '?refresh=true' : ''}`),
}

// Экспортируем API_URL на случай, если понадобится
export { API_URL }
