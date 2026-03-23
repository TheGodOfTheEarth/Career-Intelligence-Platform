// Адрес бэкенда — локально или Railway
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

// ============================================
// Базовая функция для всех запросов
// Автоматически добавляет JWT токен к каждому запросу
// ============================================
async function apiRequest(endpoint, options = {}) {
   const token = localStorage.getItem('token') // берём токен из браузера

   const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
         'Content-Type': 'application/json',
         // Если токен есть — добавляем его в заголовок
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
   })

   // Если сервер вернул 401 — токен просрочен
   if (response.status === 401) {
      localStorage.removeItem('token')
      // Выбрасываем специальную ошибку для обработки в компонентах
      const error = new Error('Сессия истекла. Пожалуйста, войдите снова.')
      error.status = 401
      throw error
   }

   const data = await response.json()

   if (!response.ok) {
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
   // Создать новую сессию (новый диалог)
   createSession: () => apiRequest('/api/chat/session', { method: 'POST' }),

   // Получить все сессии пользователя (история)
   getSessions: () => apiRequest('/api/chat/sessions'),

   // Получить конкретную сессию со всеми сообщениями
   getSession: (sessionId) => apiRequest(`/api/chat/session/${sessionId}`),

   // Отправить сообщение в ИИ
   sendMessage: (sessionId, content) =>
      apiRequest(`/api/chat/session/${sessionId}/message`, {
         method: 'POST',
         body: JSON.stringify({ content }),
      }),

   // Удалить сессию
   deleteSession: (sessionId) =>
      apiRequest(`/api/chat/session/${sessionId}`, { method: 'DELETE' }),
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
