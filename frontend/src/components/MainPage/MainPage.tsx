import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../contexts/AccountContext'
import { chat } from '../../api/api'
import './MainPage.css'

type Message = {
   text: string
   sender: 'user' | 'ai'
   id?: string
   resume?: any | null
}

type SessionMessage = {
   id?: string
   content?: string
   text?: string
   role: 'user' | 'assistant' | 'ai'
   resume?: any | null
   createdAt?: string
}

type Session = {
   id: string
   title?: string
   messages?: SessionMessage[]
   createdAt: string
   updatedAt?: string
   userId?: string
}

// Компонент для форматирования сообщений с кодом
const FormattedMessage = ({ text }: { text: string }) => {
   const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
   const parts: React.ReactNode[] = []
   let lastIndex = 0
   let match

   const decodeHtmlEntities = (str: string) => {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = str
      return textarea.value
   }

   const copyToClipboard = (code: string) => {
      const decodedCode = decodeHtmlEntities(code)
      navigator.clipboard.writeText(decodedCode)

      const notification = document.createElement('div')
      notification.textContent = '✅ Код скопирован!'
      notification.style.cssText = `
         position: fixed;
         bottom: 20px;
         right: 20px;
         background: #8c5e91;
         color: white;
         padding: 8px 16px;
         border-radius: 8px;
         font-size: 14px;
         z-index: 1000;
         animation: fadeOut 2s ease-out forwards;
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 2000)
   }

   const processText = (rawText: string) => {
      let processedText = decodeHtmlEntities(rawText)
      return processedText
   }

   while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
         const plainText = text.slice(lastIndex, match.index)
         const processedText = processText(plainText)
         parts.push(
            <div key={`text-${lastIndex}`} className="plain-text">
               {processedText.split('\n').map((line, i) => (
                  <span key={i}>
                     {line}
                     {i < processedText.split('\n').length - 1 && <br />}
                  </span>
               ))}
            </div>,
         )
      }

      const language = match[1] || 'plaintext'
      let code = decodeHtmlEntities(match[2])
      code = code.replace(/^\n+/, '').replace(/\n+$/, '')

      const languageMap: { [key: string]: string } = {
         js: 'JavaScript',
         javascript: 'JavaScript',
         ts: 'TypeScript',
         typescript: 'TypeScript',
         tsx: 'TypeScript React',
         jsx: 'React',
         py: 'Python',
         python: 'Python',
         java: 'Java',
         cpp: 'C++',
         c: 'C',
         cs: 'C#',
         csharp: 'C#',
         go: 'Go',
         rust: 'Rust',
         php: 'PHP',
         rb: 'Ruby',
         ruby: 'Ruby',
         swift: 'Swift',
         kt: 'Kotlin',
         kotlin: 'Kotlin',
         html: 'HTML',
         css: 'CSS',
         scss: 'SCSS',
         sass: 'Sass',
         json: 'JSON',
         xml: 'XML',
         sql: 'SQL',
         bash: 'Bash',
         sh: 'Shell',
         yaml: 'YAML',
         yml: 'YAML',
         md: 'Markdown',
         plaintext: 'Текст',
         text: 'Текст',
      }

      const languageName =
         languageMap[language.toLowerCase()] || language || 'Код'

      parts.push(
         <div key={`code-${match.index}`} className="code-block">
            <div className="code-header">
               <span className="code-language">
                  {languageName}
                  <span className="code-lines-count">
                     {' '}
                     ({code.split('\n').length} строк)
                  </span>
               </span>
               <button
                  className="copy-button"
                  onClick={() => copyToClipboard(code)}
                  title="Скопировать код"
               >
                  📋 Копировать
               </button>
            </div>
            <pre className="code-content">
               <code>
                  {code.split('\n').map((line, i) => {
                     const displayLine = line || ' '
                     const isBlank = line === ''

                     return (
                        <div key={i} className="code-line">
                           <span className="line-number">{i + 1}</span>
                           <span className="line-content">
                              {isBlank ? ' ' : displayLine}
                           </span>
                        </div>
                     )
                  })}
               </code>
            </pre>
         </div>,
      )

      lastIndex = match.index + match[0].length
   }

   if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex)
      const processedText = processText(remainingText)
      parts.push(
         <div key={`text-end`} className="plain-text">
            {processedText.split('\n').map((line, i) => (
               <span key={i}>
                  {line}
                  {i < processedText.split('\n').length - 1 && <br />}
               </span>
            ))}
         </div>,
      )
   }

   return <>{parts}</>
}

function MainPage() {
   const [messages, setMessages] = useState<Message[]>([
      {
         text: 'Привет! Я помогу тебе составить резюме. Расскажи о себе 👇',
         sender: 'ai',
      },
   ])
   const [input, setInput] = useState('')
   const [loading, setLoading] = useState(false)
   const [sessions, setSessions] = useState<Session[]>([])
   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
   const [showSessions, setShowSessions] = useState(false)
   const [showResumeModal, setShowResumeModal] = useState(false)
   const [selectedResume, setSelectedResume] = useState<any>(null)

   const textareaRef = useRef<HTMLTextAreaElement>(null)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   const navigate = useNavigate()
   const { account, onLogout } = useAccount()

   const showResumeDetails = (resume: any) => {
      setSelectedResume(resume)
      setShowResumeModal(true)
   }

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }

   useEffect(() => {
      scrollToBottom()
   }, [messages])

   const adjustTextareaHeight = () => {
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto'
         const maxHeight = 100
         const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight)
         textareaRef.current.style.height = `${newHeight}px`
      }
   }

   const loadSessions = async (compress = false) => {
      try {
         // Если compress=true — передаём текущую сессию для сжатия
         const data = await chat.getSessions(
            compress ? currentSessionId || undefined : undefined,
         )
         setSessions(data.sessions || [])
      } catch (error) {
         console.error('Ошибка загрузки сессий:', error)
      }
   }

   const loadSession = async (sessionId: string) => {
      try {
         setLoading(true)
         const data = await chat.getSession(sessionId)

         let formattedMessages: Message[] = []

         if (
            data.session &&
            data.session.messages &&
            Array.isArray(data.session.messages)
         ) {
            formattedMessages = data.session.messages.map((msg: any) => ({
               id: msg.id,
               text: msg.content || msg.text || '',
               sender: msg.role === 'user' ? 'user' : 'ai',
               resume: msg.resume || null,
            }))
         } else if (data.messages && Array.isArray(data.messages)) {
            formattedMessages = data.messages.map((msg: any) => ({
               id: msg.id,
               text: msg.content || msg.text || '',
               sender: msg.role === 'user' ? 'user' : 'ai',
               resume: msg.resume || null,
            }))
         } else if (Array.isArray(data)) {
            formattedMessages = data.map((msg: any) => ({
               id: msg.id,
               text: msg.content || msg.text || '',
               sender: msg.role === 'user' ? 'user' : 'ai',
               resume: msg.resume || null,
            }))
         }

         if (formattedMessages.length === 0) {
            formattedMessages = [
               {
                  text: 'Привет! Я помогу тебе составить резюме. Расскажи о себе 👇',
                  sender: 'ai',
               },
            ]
         }

         setMessages(formattedMessages)
         setCurrentSessionId(sessionId)
      } catch (error) {
         console.error('Ошибка загрузки сессии:', error)
         setMessages([
            {
               text: 'Не удалось загрузить историю чата. Попробуйте позже.',
               sender: 'ai',
            },
         ])
      } finally {
         setLoading(false)
      }
   }

   const createNewSession = async () => {
      try {
         setLoading(true)
         // Передаём ID текущей сессии чтобы бэкенд её сжал
         const data = await chat.createSession(currentSessionId || undefined)
         setCurrentSessionId(data.session.id)
         setMessages([
            {
               text: 'Привет! Я помогу тебе составить резюме. Расскажи о себе 👇',
               sender: 'ai',
            },
         ])
         await loadSessions()
      } catch (error) {
         console.error('Ошибка создания сессии:', error)
      } finally {
         setLoading(false)
      }
   }

   const handleSend = async () => {
      if (!input.trim() || loading) return

      const userMessage: Message = {
         text: input.trim(),
         sender: 'user',
      }

      setMessages((prev) => [...prev, userMessage])
      const currentInput = input.trim()
      setInput('')
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto'
      }
      setLoading(true)

      try {
         let sessionId = currentSessionId
         if (!sessionId) {
            const newSession = await chat.createSession()
            sessionId = newSession.session.id
            setCurrentSessionId(sessionId)
         }

         const response = await chat.sendMessage(sessionId, currentInput)

         const aiMessage: Message = {
            id: Date.now().toString(),
            text: response.message || generateAIResponse(currentInput),
            sender: 'ai',
            resume: response.resume || null,
         }

         setMessages((prev) => [...prev, aiMessage])
         await loadSessions()
      } catch (error: any) {
         console.error('Ошибка отправки сообщения:', error)

         if (error.status === 401) {
            onLogout()
            navigate('/')
         } else {
            const errorMessage: Message = {
               text: 'Извините, произошла ошибка. Попробуйте позже.',
               sender: 'ai',
            }
            setMessages((prev) => [...prev, errorMessage])
         }
      } finally {
         setLoading(false)
      }
   }

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleSend()
      }
   }

   const handleLogout = () => {
      onLogout()
      navigate('/')
   }

   const handleDeleteSession = async (sessionId: string) => {
      try {
         // Передаём текущую открытую сессию — бэкенд её сжмёт если удаляем другую
         await chat.deleteSession(sessionId, currentSessionId || undefined)
         await loadSessions()

         if (currentSessionId === sessionId) {
            setCurrentSessionId(null)
            setMessages([
               {
                  text: 'Привет! Я помогу тебе составить резюме. Расскажи о себе 👇',
                  sender: 'ai',
               },
            ])
         }
      } catch (error) {
         console.error('Ошибка удаления сессии:', error)
      }
   }

   const generateAIResponse = (text: string) => {
      if (text.toLowerCase().includes('опыт')) {
         return 'Опиши свой опыт: компания, роль, достижения.'
      }
      if (text.toLowerCase().includes('навык')) {
         return 'Добавь ключевые навыки: технологии и soft skills.'
      }
      if (text.toLowerCase().includes('образование')) {
         return 'Расскажи о своем образовании: учебное заведение, специальность, год окончания.'
      }
      return 'Продолжай, я собираю твоё резюме 👀'
   }

   useEffect(() => {
      loadSessions()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return (
      <div className="layout">
         {/* SIDEBAR */}
         <div className="sidebar">
            <h2>
               Здравствуйте, {account?.name || account?.email || 'пользователь'}
               !
            </h2>
            <div className="catalogButtons">
               <button
                  className="buttonSuport"
                  onClick={() => {
                     if (!showSessions) {
                        // При открытии истории — сжимаем текущую сессию
                        loadSessions(true)
                     }
                     setShowSessions(!showSessions)
                  }}
                  style={{
                     cursor: 'pointer',
                     padding: '8px',
                     borderRadius: '8px',
                     background: showSessions
                        ? 'rgba(140,94,145,0.3)'
                        : 'transparent',
                  }}
               >
                  📋 {showSessions ? 'Скрыть историю' : 'История чатов'}
               </button>

               <button
                  className="buttonSuport"
                  onClick={createNewSession}
                  style={{
                     cursor: 'pointer',
                     padding: '8px',
                     borderRadius: '8px',
                  }}
               >
                  ✨ Новый чат
               </button>
            </div>

            {showSessions && (
               <div
                  style={{
                     marginTop: '15px',
                     maxHeight: '300px',
                     overflowY: 'auto',
                     borderTop: '1px solid #2c2c2c',
                     paddingTop: '15px',
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none',
                  }}
               >
                  {sessions.length === 0 ? (
                     <p
                        style={{
                           fontSize: '12px',
                           color: '#848484',
                           textAlign: 'center',
                           padding: '10px',
                        }}
                     >
                        Нет сохраненных диалогов
                     </p>
                  ) : (
                     sessions.map((session) => (
                        <div
                           key={session.id}
                           style={{
                              padding: '8px 10px',
                              marginBottom: '8px',
                              background:
                                 currentSessionId === session.id
                                    ? '#303030'
                                    : 'transparent',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '12px',
                              transition: 'all 0.2s',
                           }}
                           onClick={() => loadSession(session.id)}
                           onMouseEnter={(e) => {
                              if (currentSessionId !== session.id) {
                                 e.currentTarget.style.background = '#2a2a2a'
                              }
                           }}
                           onMouseLeave={(e) => {
                              if (currentSessionId !== session.id) {
                                 e.currentTarget.style.background =
                                    'transparent'
                              }
                           }}
                        >
                           <span
                              style={{
                                 flex: 1,
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                              }}
                           >
                              {session.title ||
                                 `Диалог от ${new Date(session.createdAt).toLocaleDateString()}`}
                           </span>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation()
                                 handleDeleteSession(session.id)
                              }}
                              style={{
                                 background: 'none',
                                 border: 'none',
                                 cursor: 'pointer',
                                 fontSize: '14px',
                                 opacity: 0.6,
                                 color: 'white',
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.opacity = '1'
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.opacity = '0.6'
                              }}
                           >
                              🗑️
                           </button>
                        </div>
                     ))
                  )}
               </div>
            )}

            <button className="logoutBtn" onClick={handleLogout}>
               Выйти
            </button>
         </div>

         {/* MAIN CHAT */}
         <div className="chatSection">
            <div className="chatHeader">
               Career Intelligence Platform
               {currentSessionId && (
                  <span
                     style={{
                        fontSize: '11px',
                        marginLeft: '10px',
                        color: '#848484',
                     }}
                  >
                     💬 сессия активна
                  </span>
               )}
            </div>

            <div className="chatMessages">
               {messages.map((msg, index) => (
                  <div
                     key={msg.id || index}
                     className={`message ${msg.sender}`}
                  >
                     <FormattedMessage text={msg.text} />
                     {msg.resume && (
                        <div
                           style={{
                              marginTop: '10px',
                              padding: '8px',
                              background: '#212121',
                              borderRadius: '8px',
                              fontSize: '11px',
                              borderLeft: '2px solid #8c5e91',
                           }}
                        >
                           📄 Резюме сформировано!
                           <button
                              onClick={() => showResumeDetails(msg.resume)}
                              style={{
                                 marginLeft: '10px',
                                 padding: '4px 10px',
                                 background: '#4a4a4a',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '6px',
                                 cursor: 'pointer',
                                 fontSize: '10px',
                              }}
                           >
                              Посмотреть
                           </button>
                        </div>
                     )}
                  </div>
               ))}
               {loading && <div className="message ai">✍️ Печатает...</div>}
               <div ref={messagesEndRef} />
            </div>

            <div
               className="chatInput"
               style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '2rem',
                  padding: '0 20px',
               }}
            >
               <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                     setInput(e.target.value)
                     adjustTextareaHeight()
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  disabled={loading}
                  style={{
                     flex: 1,
                     maxWidth: '70vw',
                     backgroundColor: '#303030',
                     borderRadius: '20px',
                     padding: '10px 16px',
                     color: 'white',
                     border: 'none',
                     outline: 'none',
                     fontSize: '14px',
                     fontFamily: 'inherit',
                     resize: 'none',
                     minHeight: '40px',
                     maxHeight: '100px',
                     lineHeight: '1.4',
                     opacity: loading ? 0.7 : 1,
                     cursor: loading ? 'not-allowed' : 'text',
                     overflowY: 'auto',
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none',
                     margin: '10px 0 -20px 0',
                  }}
               />
               <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                     width: '40px',
                     height: '40px',
                     borderRadius: '50%',
                     background:
                        !loading && input.trim() ? '#8c5e91' : '#4a4a4a',
                     border: 'none',
                     cursor:
                        !loading && input.trim() ? 'pointer' : 'not-allowed',
                     transition: 'all 0.2s',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '20px',
                     color: 'white',
                     flexShrink: 0,
                     marginTop: '30px',
                  }}
                  onMouseEnter={(e) => {
                     if (!loading && input.trim()) {
                        e.currentTarget.style.background = '#6d4772'
                        e.currentTarget.style.transform = 'scale(1.05)'
                     }
                  }}
                  onMouseLeave={(e) => {
                     if (!loading && input.trim()) {
                        e.currentTarget.style.background = '#8c5e91'
                        e.currentTarget.style.transform = 'scale(1)'
                     }
                  }}
               >
                  ↑
               </button>
            </div>
         </div>

         {/* Модальное окно для резюме */}
         {showResumeModal && (
            <div
               className="modal-overlay"
               onClick={() => setShowResumeModal(false)}
            >
               <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="modal-header">
                     <h3>📄 Детали резюме</h3>
                     <button
                        className="modal-close"
                        onClick={() => setShowResumeModal(false)}
                     >
                        ✕
                     </button>
                  </div>
                  <div className="modal-body">
                     <pre className="resume-json">
                        {JSON.stringify(selectedResume, null, 2)}
                     </pre>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}

export default MainPage
