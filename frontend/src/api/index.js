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

   // Если сервер вернул 401 — токен просрочен, выкидываем на логин
   if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return
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
   // Регистрация — сохраняет токен автоматически
   register: async ({ name, email, password }) => {
      const data = await apiRequest('/api/auth/register', {
         method: 'POST',
         body: JSON.stringify({ name, email, password }),
      })
      localStorage.setItem('token', data.token) // сохраняем токен
      return data
   },

   // Вход — сохраняет токен автоматически
   login: async ({ email, password }) => {
      const data = await apiRequest('/api/auth/login', {
         method: 'POST',
         body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('token', data.token) // сохраняем токен
      return data
   },

   // Выход — удаляет токен
   logout: () => {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
