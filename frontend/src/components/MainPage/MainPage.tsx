import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../contexts/AccountContext'
import './MainPage.css'

type Message = {
   text: string
   sender: 'user' | 'ai'
}

function MainPage() {
   const [messages, setMessages] = useState<Message[]>([
      {
         text: 'Привет! Я помогу тебе составить резюме. Расскажи о себе 👇',
         sender: 'ai',
      },
   ])
   const [input, setInput] = useState('')

   const navigate = useNavigate()
   const { account, onLogout } = useAccount()

   const handleSend = () => {
      if (!input.trim()) return

      const userMessage: Message = {
         text: input,
         sender: 'user',
      }

      const aiMessage: Message = {
         text: generateAIResponse(input),
         sender: 'ai',
      }

      setMessages((prev) => [...prev, userMessage, aiMessage])
      setInput('')
   }

   const handleLogout = () => {
      onLogout()
      navigate('/')
   }

   const generateAIResponse = (text: string) => {
      if (text.toLowerCase().includes('опыт')) {
         return 'Опиши свой опыт: компания, роль, достижения.'
      }
      if (text.toLowerCase().includes('навык')) {
         return 'Добавь ключевые навыки: технологии и soft skills.'
      }
      return 'Продолжай, я собираю твоё резюме 👀'
   }

   return (
      <div className="layout">
         {/* SIDEBAR */}
         <div className="sidebar">
            <h2>
               Здравствуйте, {account?.name || account?.email || 'пользователь'}
               !
            </h2>
            <div className="catalogButtons">
               <button className="buttonSuport">Чат поддержки</button>
               <button className="buttonSuport">Контакты</button>
            </div>
            <button className="logoutBtn" onClick={handleLogout}>
               Выйти
            </button>
         </div>

         {/* MAIN CHAT */}
         <div className="chatSection">
            <div className="chatHeader">Career Intelligence Platform</div>

            <div className="chatMessages">
               {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                     {msg.text}
                  </div>
               ))}
            </div>

            <div className="chatInput">
               <input
                  type="text"
                  placeholder="Напиши что-нибудь..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="inputMain"
               />
               <button onClick={handleSend} className="buttonSend">
                  ➤
               </button>
            </div>
         </div>
      </div>
   )
}

export default MainPage
