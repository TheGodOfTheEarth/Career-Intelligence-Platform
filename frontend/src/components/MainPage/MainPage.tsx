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

// Компонент для форматирования сообщений с кодом (НЕ показывает JSON)
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
      const language = match[1] || 'plaintext'

      // ПРОПУСКАЕМ JSON блоки - они не будут показаны в чате
      if (language.toLowerCase() === 'json') {
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
         lastIndex = match.index + match[0].length
         continue
      }

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

// Компонент для извлечения JSON из текста
const extractJsonFromText = (text: string): any => {
   const jsonRegex = /```json\n([\s\S]*?)```/
   const match = text.match(jsonRegex)
   if (match && match[1]) {
      try {
         return JSON.parse(match[1])
      } catch (e) {
         console.error('Ошибка парсинга JSON:', e)
         return null
      }
   }
   return null
}

// Компонент для отображения форматированного резюме (в чате)
const FormattedResumeInChat = ({
   resumeData,
   messageText,
}: {
   resumeData: any
   messageText: string
}) => {
   // Пробуем получить данные из resume или парсим из текста
   let parsed = null
   let jsonData = null

   if (resumeData?.content) {
      try {
         parsed = JSON.parse(resumeData.content)
      } catch (e) {
         console.log('Ошибка парсинга content')
      }
   }

   // Извлекаем JSON из текста сообщения
   jsonData = extractJsonFromText(messageText)

   const resume =
      parsed?.resume || resumeData?.resume || jsonData?.resume || resumeData
   const analysis =
      parsed?.analysis || resumeData?.analysis || jsonData?.analysis

   const formatSalary = (min: number, max: number): string => {
      if ((!min || min === 0) && (!max || max === 0)) return 'не указана'
      if (min && min > 0 && max && max > 0)
         return `${min.toLocaleString('ru-RU')} — ${max.toLocaleString('ru-RU')} ₽`
      if (min && min > 0) return `от ${min.toLocaleString('ru-RU')} ₽`
      if (max && max > 0) return `до ${max.toLocaleString('ru-RU')} ₽`
      return 'не указана'
   }

   const formatArray = (
      arr: any[],
      placeholder: string = 'не указаны',
   ): string => {
      if (!arr || arr.length === 0) return placeholder
      return (
         arr
            .filter(
               (item) => item && item !== 'не указано' && item !== 'не указан',
            )
            .join(', ') || placeholder
      )
   }

   return (
      <div style={{ marginTop: '10px', fontSize: '13px' }}>
         <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#8c5e91', marginBottom: '12px' }}>
               📄 Резюме
            </h4>

            <div style={{ marginBottom: '8px' }}>
               <strong>Имя:</strong> {resume?.name || 'не указано'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Город:</strong> {resume?.contact?.city || 'не указан'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Email:</strong> {resume?.contact?.email || 'не указан'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>О себе:</strong> {resume?.summary || 'не указано'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Навыки:</strong>
               <div style={{ marginLeft: '20px', marginTop: '4px' }}>
                  <div>💻 Hard skills: {formatArray(resume?.skills?.hard)}</div>
                  <div>🤝 Soft skills: {formatArray(resume?.skills?.soft)}</div>
               </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Образование:</strong> {resume?.education || 'не указано'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Опыт работы:</strong>{' '}
               {resume?.experience && resume.experience.length > 0
                  ? resume.experience.map((exp: any, idx: number) => (
                       <div
                          key={idx}
                          style={{ marginLeft: '20px', marginTop: '4px' }}
                       >
                          {typeof exp === 'string'
                             ? exp
                             : `${exp.position || ''} в ${exp.company || ''}`}
                       </div>
                    ))
                  : 'не указан'}
            </div>

            <div style={{ marginBottom: '8px' }}>
               <strong>Целевая позиция:</strong>{' '}
               {resume?.targetPosition || 'не указана'}
            </div>
         </div>

         {analysis && (
            <div style={{ marginBottom: '16px' }}>
               <h4 style={{ color: '#8c5e91', marginBottom: '12px' }}>
                  📊 Карьерный анализ
               </h4>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Позиция сейчас:</strong>{' '}
                  {analysis.currentPosition || 'не определена'}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Зарплата сейчас:</strong>{' '}
                  {formatSalary(
                     analysis.currentSalaryMin,
                     analysis.currentSalaryMax,
                  )}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Позиция через 6-12 месяцев:</strong>{' '}
                  {analysis.futurePosition || 'не определена'}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Зарплата в будущем:</strong>{' '}
                  {formatSalary(
                     analysis.futureSalaryMin,
                     analysis.futureSalaryMax,
                  )}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Чего не хватает:</strong>{' '}
                  {formatArray(analysis.missingSkills, 'не указано')}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>Рекомендации:</strong>{' '}
                  {formatArray(analysis.recommendations, 'не указано')}
               </div>

               <div style={{ marginBottom: '8px' }}>
                  <strong>План обучения:</strong>{' '}
                  {analysis.learningPath || 'не определен'}
               </div>
            </div>
         )}
      </div>
   )
}

// Компонент для отображения JSON в модальном окне
const JsonViewer = ({ messageText }: { messageText: string }) => {
   const jsonData = extractJsonFromText(messageText)

   const copyToClipboard = () => {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
      const notification = document.createElement('div')
      notification.textContent = '✅ JSON скопирован!'
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
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 2000)
   }

   return (
      <div style={{ padding: '20px' }}>
         <div
            style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '16px',
            }}
         >
            <span style={{ color: '#8c5e91', fontSize: '12px' }}>
               JSON ({Object.keys(jsonData || {}).length} полей)
            </span>
            <button
               onClick={copyToClipboard}
               style={{
                  padding: '6px 12px',
                  background: '#4a4a4a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
               }}
            >
               📋 Копировать
            </button>
         </div>
         <pre
            style={{
               background: '#1e1e1e',
               padding: '16px',
               borderRadius: '8px',
               overflow: 'auto',
               maxHeight: '60vh',
               fontSize: '12px',
               color: '#d4d4d4',
               margin: 0,
            }}
         >
            {JSON.stringify(jsonData, null, 2)}
         </pre>
      </div>
   )
}

function MainPage() {
   const [sidebarOpen, setSidebarOpen] = useState(false)
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
   const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

   const textareaRef = useRef<HTMLTextAreaElement>(null)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   const navigate = useNavigate()
   const { account, onLogout } = useAccount()

   // ============================================
   // ГЕНЕРАЦИЯ PDF
   // ============================================
   const downloadPDF = (resumeData: any, messageText: string) => {
      console.log('PDF DATA:', resumeData)

      let parsed = null
      let jsonData = extractJsonFromText(messageText)

      if (resumeData?.content) {
         try {
            parsed = JSON.parse(resumeData.content)
            console.log('PARSED FROM CONTENT:', parsed)
         } catch (e) {
            console.log('Ошибка парсинга content')
         }
      }

      const resume =
         parsed?.resume || resumeData?.resume || jsonData?.resume || resumeData
      const analysis =
         parsed?.analysis || resumeData?.analysis || jsonData?.analysis

      console.log('FINAL RESUME:', resume)
      console.log('FINAL ANALYSIS:', analysis)

      // Форматирование зарплаты
      const formatSalary = (min: number, max: number): string | null => {
         if ((!min || min === 0) && (!max || max === 0)) return null
         if (min && min > 0 && max && max > 0)
            return `${min.toLocaleString('ru-RU')} — ${max.toLocaleString('ru-RU')} ₽`
         if (min && min > 0) return `от ${min.toLocaleString('ru-RU')} ₽`
         if (max && max > 0) return `до ${max.toLocaleString('ru-RU')} ₽`
         return null
      }

      // Получаем имя
      const userName =
         resume?.name && resume.name !== 'не указано' ? resume.name : 'Кандидат'

      // Целевая позиция
      const targetPosition =
         resume?.targetPosition || analysis?.futurePosition || null

      // Желаемая зарплата
      const desiredSalary = formatSalary(
         analysis?.futureSalaryMin,
         analysis?.futureSalaryMax,
      )

      // Контакты
      const contacts = []
      if (
         resume?.contact?.email &&
         resume.contact.email !== 'placeholder@email.com'
      )
         contacts.push({ icon: '📧', value: resume.contact.email })
      if (resume?.contact?.phone && resume.contact.phone !== 'не указан')
         contacts.push({ icon: '📞', value: resume.contact.phone })
      if (resume?.contact?.city && resume.contact.city !== 'не указан')
         contacts.push({ icon: '📍', value: resume.contact.city })
      if (resume?.contact?.telegram && resume.contact.telegram !== 'не указан')
         contacts.push({ icon: '💬', value: resume.contact.telegram })

      // Навыки
      const hardSkills =
         resume?.skills?.hard?.filter((s: string) => s && s !== 'не указано') ||
         []
      const softSkills =
         resume?.skills?.soft?.filter((s: string) => s && s !== 'не указано') ||
         []

      // Образование
      const education =
         resume?.education && resume.education !== 'не указано'
            ? resume.education
            : null

      // Опыт работы
      const experience =
         resume?.experience?.filter((exp: any) => {
            if (typeof exp === 'string')
               return exp.trim() !== '' && exp !== 'не указано'
            return exp && Object.keys(exp).length > 0
         }) || []

      // Summary
      const summary =
         resume?.summary && resume.summary !== 'не указано'
            ? resume.summary
            : null

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Резюме - ${userName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', 'Segoe UI', 'Roboto', serif;
      background: #e8e8e8;
      padding: 0;
      margin: 0;
      line-height: 1.4;
      color: #1a1a1a;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Контейнер строго на всю страницу A4 */
    .resume-container {
      width: 210mm;
      min-height: 290mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    /* Шапка с двойной линией как в классическом резюме */
    .resume-header {
      padding: 35px 40px 20px 40px;
      border-bottom: 2px solid #1a1a1a;
    }
    
    .resume-header h1 {
      font-size: 42px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #1a1a1a;
      margin-bottom: 10px;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    
    .resume-header .subtitle {
      font-size: 18px;
      color: #555;
      font-weight: 400;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    
    .header-divider {
      height: 1px;
      background: #ccc;
      margin: 14px 0;
    }
    
    .contacts-row {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
      margin-top: 14px;
      font-size: 14px;
      color: #555;
      font-family: 'Segoe UI', sans-serif;
    }
    
    .contacts-row span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    /* Основной контент - две колонки */
    .resume-body {
      display: flex;
      padding: 35px 40px 40px 40px;
      gap: 45px;
      flex: 1;
    }
    
    .left-column {
      flex: 1.2;
      min-width: 220px;
    }
    
    .right-column {
      flex: 2.5;
    }
    
    /* Секции */
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #1a1a1a;
      border-bottom: 1px solid #1a1a1a;
      padding-bottom: 8px;
      margin-bottom: 18px;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    
    /* Контактная информация */
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
      font-family: 'Segoe UI', sans-serif;
    }
    
    .contact-item .icon {
      width: 28px;
      color: #555;
      font-size: 16px;
    }
    
    /* Навыки */
    .skill-item {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .skill-category {
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 8px;
      font-size: 13px;
      text-transform: uppercase;
      color: #666;
    }
    
    /* О себе */
    .summary-text {
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      text-align: justify;
      margin-bottom: 24px;
    }
    
    /* Опыт работы */
    .experience-item {
      margin-bottom: 24px;
    }
    
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    
    .exp-company {
      font-weight: 700;
      font-size: 15px;
      color: #1a1a1a;
    }
    
    .exp-period {
      font-size: 13px;
      color: #888;
      font-style: italic;
    }
    
    .exp-position {
      font-weight: 600;
      font-size: 14px;
      color: #555;
      margin-bottom: 10px;
    }
    
    .exp-duties {
      padding-left: 20px;
      margin-top: 8px;
    }
    
    .exp-duties li {
      font-size: 13px;
      color: #444;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    
    /* Образование */
    .education-item {
      margin-bottom: 16px;
    }
    
    .edu-degree {
      font-weight: 700;
      font-size: 14px;
      color: #1a1a1a;
    }
    
    .edu-place {
      font-size: 13px;
      color: #555;
      margin-top: 4px;
    }
    
    .edu-year {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
    
    /* Зарплата */
    .salary-block {
      background: #f5f5f5;
      padding: 14px 18px;
      margin: 20px 0;
      border-left: 3px solid #1a1a1a;
    }
    
    .salary-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    
    .salary-value {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    /* Footer прижат к низу */
    .resume-footer {
      margin-top: auto;
      padding: 20px 40px 25px 40px;
      border-top: 1px solid #eee;
    }
    
    .note {
      font-size: 10px;
      color: #aaa;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .resume-container {
        box-shadow: none;
        width: 100%;
        min-height: 100%;
      }
    }
    
    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="resume-header">
      <h1>${escapeHtml(userName)}</h1>
      ${targetPosition ? `<div class="subtitle">${escapeHtml(targetPosition.toUpperCase())}</div>` : ''}
      <div class="header-divider"></div>
      ${
         contacts.length > 0
            ? `
        <div class="contacts-row">
          ${contacts.map((c) => `<span>${c.icon} ${escapeHtml(c.value)}</span>`).join('')}
        </div>
      `
            : ''
      }
    </div>
    
    <div class="resume-body">
      <div class="left-column">
        ${
           contacts.length > 0
              ? `
          <div class="section">
            <div class="section-title">Контакты</div>
            ${contacts
               .map(
                  (c) => `
              <div class="contact-item">
                <span class="icon">${c.icon}</span>
                <span>${escapeHtml(c.value)}</span>
              </div>
            `,
               )
               .join('')}
          </div>
        `
              : ''
        }
        
        ${
           hardSkills.length > 0
              ? `
          <div class="section">
            <div class="section-title">Навыки</div>
            ${hardSkills.map((skill: string) => `<div class="skill-item">• ${escapeHtml(skill)}</div>`).join('')}
          </div>
        `
              : ''
        }
        
        ${
           softSkills.length > 0
              ? `
          <div class="section">
            <div class="section-title">Личные качества</div>
            ${softSkills.map((skill: string) => `<div class="skill-item">• ${escapeHtml(skill)}</div>`).join('')}
          </div>
        `
              : ''
        }
        
        ${
           desiredSalary
              ? `
          <div class="salary-block">
            <div class="salary-label">Желаемая зарплата</div>
            <div class="salary-value">${escapeHtml(desiredSalary)}</div>
          </div>
        `
              : ''
        }
      </div>
      
      <div class="right-column">
        ${
           summary
              ? `
          <div class="section">
            <div class="section-title">О себе</div>
            <div class="summary-text">${escapeHtml(summary)}</div>
          </div>
        `
              : ''
        }
        
        ${
           experience.length > 0
              ? `
          <div class="section">
            <div class="section-title">Опыт работы</div>
            ${experience
               .map((exp: any) => {
                  if (typeof exp === 'string') {
                     return `<div class="experience-item"><div class="summary-text">${escapeHtml(exp)}</div></div>`
                  }
                  return `
                <div class="experience-item">
                  <div class="exp-header">
                    <span class="exp-company">${escapeHtml(exp.company || exp.place || 'Место работы')}</span>
                    <span class="exp-period">${escapeHtml(exp.period || exp.date || '')}</span>
                  </div>
                  ${exp.position ? `<div class="exp-position">${escapeHtml(exp.position)}</div>` : ''}
                  ${
                     exp.duties && exp.duties.length > 0
                        ? `
                    <ul class="exp-duties">
                      ${exp.duties.map((duty: string) => `<li>${escapeHtml(duty)}</li>`).join('')}
                    </ul>
                  `
                        : ''
                  }
                  ${exp.description ? `<div class="summary-text" style="margin-top:8px;">${escapeHtml(exp.description)}</div>` : ''}
                </div>
              `
               })
               .join('')}
          </div>
        `
              : ''
        }
        
        ${
           education
              ? `
          <div class="section">
            <div class="section-title">Образование</div>
            <div class="education-item">
              <div class="edu-degree">${escapeHtml(education)}</div>
            </div>
          </div>
        `
              : ''
        }
      </div>
    </div>
    
    <div class="resume-footer">
      <div class="note">
        Резюме сгенерировано платформой Career Intelligence Platform • МАДИ
      </div>
    </div>
  </div>
</body>
</html>
  `

      function escapeHtml(str: string): string {
         if (!str) return ''
         return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\\n/g, '<br>')
            .replace(/\n/g, '<br>')
      }

      const element = document.createElement('div')
      element.innerHTML = htmlContent
      document.body.appendChild(element)

      import('html2pdf.js').then((html2pdfModule: any) => {
         const html2pdf = html2pdfModule.default
         html2pdf()
            .from(element)
            .set({
               margin: 0,
               filename: `Резюме_${userName.replace(/\s+/g, '_')}.pdf`,
               image: { type: 'jpeg', quality: 0.98 },
               html2canvas: { scale: 2, useCORS: true, logging: false },
               jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .save()
            .then(() => {
               document.body.removeChild(element)
            })
            .catch((err: any) => {
               console.error('PDF error:', err)
               document.body.removeChild(element)
            })
      })
   }

   const showResumeDetails = (message: Message) => {
      setSelectedMessage(message)
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
         console.log('RESPONSE:', response)

         // Пытаемся вытащить resume из текста, если бэк не отдал отдельно
         let parsedResume = null

         try {
            const parsed = JSON.parse(response.message)
            parsedResume = parsed
            console.log('PARSED RESUME:', parsedResume)
         } catch (e) {
            console.log('НЕ JSON, обычный текст')
         }

         const aiMessage: Message = {
            id: Date.now().toString(),
            text: response.message || '',
            sender: 'ai',
            resume: response.resume || parsedResume,
         }

         console.log('AI MESSAGE:', aiMessage)

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

   useEffect(() => {
      loadSessions()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return (
      <div className="layout">
         {/* SIDEBAR */}
         <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <button
               className="closeSidebar"
               onClick={() => setSidebarOpen(false)}
            >
               ✕
            </button>
            <h2>
               Здравствуйте, {account?.name || account?.email || 'пользователь'}
               !
            </h2>
            <div className="catalogButtons">
               <button
                  className="buttonSuport"
                  onClick={() => {
                     if (!showSessions) {
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
                           onClick={() => {
                              loadSession(session.id)
                              setSidebarOpen(false)
                           }}
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
                     💬 сессия
                  </span>
               )}
               <button
                  className="burgerButton"
                  onClick={() => setSidebarOpen(true)}
               >
                  ☰
               </button>
            </div>

            <div className="chatMessages">
               {messages.map((msg, index) => {
                  console.log('MSG.RESUME:', msg.resume)
                  const hasResume = msg.resume || extractJsonFromText(msg.text)

                  return (
                     <div
                        key={msg.id || index}
                        className={`message ${msg.sender}`}
                     >
                        <FormattedMessage text={msg.text} />
                        {hasResume && msg.sender === 'ai' && (
                           <>
                              <FormattedResumeInChat
                                 resumeData={msg.resume}
                                 messageText={msg.text}
                              />
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
                                    onClick={() => showResumeDetails(msg)}
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
                                    Посмотреть JSON
                                 </button>
                                 <button
                                    onClick={() =>
                                       downloadPDF(msg.resume, msg.text)
                                    }
                                    style={{
                                       marginLeft: '6px',
                                       padding: '4px 10px',
                                       background: '#6d4772',
                                       color: 'white',
                                       border: 'none',
                                       borderRadius: '6px',
                                       cursor: 'pointer',
                                       fontSize: '10px',
                                    }}
                                 >
                                    📥 Скачать PDF
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  )
               })}
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

         {/* Модальное окно для JSON */}
         {showResumeModal && selectedMessage && (
            <div
               className="modal-overlay"
               onClick={() => setShowResumeModal(false)}
            >
               <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="modal-header">
                     <h3>📄 JSON резюме</h3>
                     <div
                        style={{
                           display: 'flex',
                           gap: '8px',
                           alignItems: 'center',
                        }}
                     >
                        <button
                           onClick={() =>
                              downloadPDF(
                                 selectedMessage.resume,
                                 selectedMessage.text,
                              )
                           }
                           style={{
                              padding: '6px 12px',
                              background: '#6d4772',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                           }}
                        >
                           📥 Скачать PDF
                        </button>
                        <button
                           className="modal-close"
                           onClick={() => setShowResumeModal(false)}
                        >
                           ✕
                        </button>
                     </div>
                  </div>
                  <div className="modal-body">
                     <JsonViewer messageText={selectedMessage.text} />
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}

export default MainPage
