// Адрес бэкенда — локально или Railway
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

// ============================================
// Базовая функция для всех запросов
// Автоматически добавляет JWT токен к каждому запросу
// ============================================
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
      localStorage.removeItem('token')
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
   // Регистрация — возвращает токен и данные пользователя
   register: async ({ name, email, password }) => {
      const data = await apiRequest('/api/auth/register', {
         method: 'POST',
         body: JSON.stringify({ name, email, password }),
      })
      // Сохраняем токен в localStorage
      if (data.token) {
         localStorage.setItem('token', data.token)
      }
      return data
   },

   // Вход — возвращает токен и данные пользователя
   login: async ({ email, password }) => {
      const data = await apiRequest('/api/auth/login', {
         method: 'POST',
         body: JSON.stringify({ email, password }),
      })
      // Сохраняем токен в localStorage
      if (data.token) {
         localStorage.setItem('token', data.token)
      }
      return data
   },

   // Выход — удаляет токен
   logout: () => {
      localStorage.removeItem('token')
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

// Экспортируем API_URL на случай, если понадобится
export { API_URL }
