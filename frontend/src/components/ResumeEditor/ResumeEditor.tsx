import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resume as resumeApi } from '../../api/api'
import './ResumeEditor.css'

type Template = 'classic' | 'modern' | 'minimal'

type ResumeState = {
   name: string
   city: string
   email: string
   phone: string
   telegram: string
   summary: string
   hardSkills: string[]
   softSkills: string[]
   education: string
   experience: string[]
   targetPosition: string
}

type Analysis = {
   currentPosition?: string
   currentSalaryMin?: number
   currentSalaryMax?: number
   futurePosition?: string
   futureSalaryMin?: number
   futureSalaryMax?: number
   missingSkills?: string[]
   recommendations?: string[]
   learningPath?: string
}

function TagInput({
   tags,
   onChange,
   placeholder,
}: {
   tags: string[]
   onChange: (tags: string[]) => void
   placeholder: string
}) {
   const [input, setInput] = useState('')

   const add = () => {
      const val = input.trim()
      if (val && !tags.includes(val)) {
         onChange([...tags, val])
      }
      setInput('')
   }

   const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i))

   return (
      <div className="tag-input-container">
         <div className="tags-list">
            {tags.map((tag, i) => (
               <span key={i} className="tag">
                  {tag}
                  <button onClick={() => remove(i)}>×</button>
               </span>
            ))}
         </div>
         <div className="tag-add-row">
            <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     e.preventDefault()
                     add()
                  }
               }}
               placeholder={placeholder}
               className="tag-input"
            />
            <button onClick={add} className="tag-add-btn">
               +
            </button>
         </div>
      </div>
   )
}

function ResumeEditor() {
   const { id } = useParams<{ id: string }>()
   const navigate = useNavigate()

   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [analysis, setAnalysis] = useState<Analysis | null>(null)
   const [resumeSessionId, setResumeSessionId] = useState<string | null>(null)
   const [template, setTemplate] = useState<Template>('modern')
   const [newExpBlock, setNewExpBlock] = useState('')
   const [saved, setSaved] = useState(false)

   const [form, setForm] = useState<ResumeState>({
      name: '',
      city: '',
      email: '',
      phone: '',
      telegram: '',
      summary: '',
      hardSkills: [],
      softSkills: [],
      education: '',
      experience: [],
      targetPosition: '',
   })

   useEffect(() => {
      const fetchData = async () => {
         try {
            const raw = await resumeApi.getById(id!)
            // API shape: { resume: { id, content: '{"resume":{...},"analysis":{...}}', ... } }
            const resumeRow = raw?.resume
            let content: any = null
            if (typeof resumeRow?.content === 'string') {
               try {
                  content = JSON.parse(resumeRow.content)
               } catch {}
            } else if (resumeRow?.content && typeof resumeRow.content === 'object') {
               content = resumeRow.content
            }
            const r = content?.resume ?? resumeRow
            const a = content?.analysis ?? null

            setResumeSessionId(resumeRow?.sessionId || null)
            setForm({
               name: r?.name || '',
               city: r?.contact?.city || '',
               email: r?.contact?.email || '',
               phone: r?.contact?.phone || '',
               telegram: r?.contact?.telegram || '',
               summary: r?.summary || '',
               hardSkills:
                  r?.skills?.hard?.filter(
                     (s: string) => s && s !== 'не указано',
                  ) || [],
               softSkills:
                  r?.skills?.soft?.filter(
                     (s: string) => s && s !== 'не указано',
                  ) || [],
               education: r?.education || '',
               experience: Array.isArray(r?.experience)
                  ? r.experience.map((e: any) =>
                       typeof e === 'string'
                          ? e
                          : `${e.position || ''} в ${e.company || ''}`.trim(),
                    )
                  : [],
               targetPosition: r?.targetPosition || '',
            })
            setAnalysis(a || null)
         } catch {
            setError('Не удалось загрузить резюме')
         } finally {
            setLoading(false)
         }
      }
      fetchData()
   }, [id])

   const update = (field: keyof ResumeState, value: any) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setSaved(false)
   }

   const handleSave = () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
   }

   const escHtml = (str: string): string => {
      if (!str) return ''
      return str
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#39;')
         .replace(/\n/g, '<br>')
   }

   const formatSalary = (min?: number, max?: number): string | null => {
      if ((!min || min === 0) && (!max || max === 0)) return null
      if (min && min > 0 && max && max > 0)
         return `${min.toLocaleString('ru-RU')} — ${max.toLocaleString('ru-RU')} ₽`
      if (min && min > 0) return `от ${min.toLocaleString('ru-RU')} ₽`
      if (max && max > 0) return `до ${max.toLocaleString('ru-RU')} ₽`
      return null
   }

   const buildContacts = () => {
      const list: { icon: string; value: string }[] = []
      if (form.email && form.email !== 'placeholder@email.com')
         list.push({ icon: '📧', value: form.email })
      if (form.phone && form.phone !== 'не указан')
         list.push({ icon: '📞', value: form.phone })
      if (form.city && form.city !== 'не указан')
         list.push({ icon: '📍', value: form.city })
      if (form.telegram && form.telegram !== 'не указан')
         list.push({ icon: '💬', value: form.telegram })
      return list
   }

   const generateClassicHtml = (): string => {
      const contacts = buildContacts()
      const desiredSalary = formatSalary(
         analysis?.futureSalaryMin,
         analysis?.futureSalaryMax,
      )

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Резюме</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Georgia','Times New Roman',serif; background:white; color:#1a1a1a; line-height:1.5; padding:50px 60px; max-width:800px; margin:0 auto; }
h1 { font-size:34px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:8px; }
.pos { font-size:15px; color:#555; margin-bottom:14px; }
hr { border:none; border-top:2px solid #1a1a1a; margin:14px 0 16px; }
.contacts { display:flex; flex-wrap:wrap; gap:18px; font-size:13px; color:#555; margin-bottom:24px; }
.body { display:flex; gap:40px; }
.left { width:210px; flex-shrink:0; }
.right { flex:1; }
.section-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #1a1a1a; padding-bottom:5px; margin-bottom:12px; margin-top:22px; }
.left .section-title:first-child { margin-top:0; }
.skill-item { font-size:13px; color:#333; margin-bottom:7px; }
.text { font-size:13px; color:#333; line-height:1.6; }
.exp-item { margin-bottom:18px; }
.salary-box { background:#f5f5f5; border-left:3px solid #1a1a1a; padding:10px 14px; margin-top:14px; }
.salary-label { font-size:11px; text-transform:uppercase; color:#666; letter-spacing:1px; }
.salary-val { font-size:19px; font-weight:700; }
.footer { margin-top:30px; border-top:1px solid #eee; padding-top:12px; text-align:center; font-size:10px; color:#aaa; }
@page { size:A4; margin:0; }
</style></head><body>
<h1>${escHtml(form.name || 'Кандидат')}</h1>
${form.targetPosition ? `<div class="pos">${escHtml(form.targetPosition.toUpperCase())}</div>` : ''}
<hr>
${contacts.length ? `<div class="contacts">${contacts.map((c) => `<span>${c.icon} ${escHtml(c.value)}</span>`).join('')}</div>` : ''}
<div class="body">
  <div class="left">
    ${form.hardSkills.length ? `<div class="section-title">Навыки</div>${form.hardSkills.map((s) => `<div class="skill-item">• ${escHtml(s)}</div>`).join('')}` : ''}
    ${form.softSkills.length ? `<div class="section-title">Личные качества</div>${form.softSkills.map((s) => `<div class="skill-item">• ${escHtml(s)}</div>`).join('')}` : ''}
    ${desiredSalary ? `<div class="salary-box"><div class="salary-label">Желаемая зарплата</div><div class="salary-val">${escHtml(desiredSalary)}</div></div>` : ''}
  </div>
  <div class="right">
    ${form.summary ? `<div class="section-title">О себе</div><p class="text">${escHtml(form.summary)}</p>` : ''}
    ${form.experience.length ? `<div class="section-title">Опыт работы</div>${form.experience.map((e) => `<div class="exp-item"><p class="text">${escHtml(e)}</p></div>`).join('')}` : ''}
    ${form.education ? `<div class="section-title">Образование</div><p class="text">${escHtml(form.education)}</p>` : ''}
  </div>
</div>
<div class="footer">Резюме сгенерировано платформой Career Intelligence Platform</div>
</body></html>`
   }

   const generateModernHtml = (): string => {
      const contacts = buildContacts()
      const desiredSalary = formatSalary(
         analysis?.futureSalaryMin,
         analysis?.futureSalaryMax,
      )

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Резюме</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI','Roboto',sans-serif; background:#e8e8e8; color:#1a1a1a; height:100vh; display:flex; align-items:center; justify-content:center; }
.container { width:210mm; min-height:290mm; background:white; box-shadow:0 8px 24px rgba(0,0,0,0.12); display:flex; flex-direction:column; }
.header { padding:35px 40px 20px; border-bottom:2px solid #1a1a1a; }
.header h1 { font-size:38px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
.subtitle { font-size:16px; color:#555; margin-bottom:12px; }
.hdivider { height:1px; background:#ccc; margin:10px 0; }
.contacts-row { display:flex; flex-wrap:wrap; gap:22px; font-size:13px; color:#555; margin-top:10px; }
.body { display:flex; padding:30px 40px 40px; gap:40px; flex:1; }
.left { flex:1.2; min-width:190px; }
.right { flex:2.5; }
.section { margin-bottom:26px; }
.section-title { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#1a1a1a; border-bottom:2px solid #7c3aed; padding-bottom:5px; margin-bottom:14px; }
.contact-item { display:flex; align-items:center; gap:10px; font-size:13px; color:#333; margin-bottom:9px; }
.skill-item { font-size:12px; color:#333; padding:3px 9px; background:#f3e8ff; border-radius:4px; display:inline-block; margin:0 3px 5px 0; }
.soft-item { background:#f0f0f0; }
.text { font-size:13px; color:#333; line-height:1.6; }
.exp-item { margin-bottom:18px; }
.salary-block { background:#f3e8ff; padding:10px 14px; margin:14px 0; border-left:3px solid #7c3aed; border-radius:4px; }
.salary-label { font-size:11px; text-transform:uppercase; color:#666; letter-spacing:1px; margin-bottom:3px; }
.salary-value { font-size:19px; font-weight:700; color:#7c3aed; }
.footer { margin-top:auto; padding:14px 40px 18px; border-top:1px solid #eee; text-align:center; font-size:10px; color:#aaa; }
@media print { body { background:white; } .container { box-shadow:none; width:100%; } }
@page { size:A4; margin:0; }
</style></head><body>
<div class="container">
  <div class="header">
    <h1>${escHtml(form.name || 'Кандидат')}</h1>
    ${form.targetPosition ? `<div class="subtitle">${escHtml(form.targetPosition)}</div>` : ''}
    <div class="hdivider"></div>
    ${contacts.length ? `<div class="contacts-row">${contacts.map((c) => `<span>${c.icon} ${escHtml(c.value)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="body">
    <div class="left">
      ${contacts.length ? `<div class="section"><div class="section-title">Контакты</div>${contacts.map((c) => `<div class="contact-item"><span>${c.icon}</span><span>${escHtml(c.value)}</span></div>`).join('')}</div>` : ''}
      ${form.hardSkills.length ? `<div class="section"><div class="section-title">Навыки</div><div>${form.hardSkills.map((s) => `<span class="skill-item">${escHtml(s)}</span>`).join('')}</div></div>` : ''}
      ${form.softSkills.length ? `<div class="section"><div class="section-title">Личные качества</div><div>${form.softSkills.map((s) => `<span class="skill-item soft-item">${escHtml(s)}</span>`).join('')}</div></div>` : ''}
      ${desiredSalary ? `<div class="salary-block"><div class="salary-label">Желаемая зарплата</div><div class="salary-value">${escHtml(desiredSalary)}</div></div>` : ''}
    </div>
    <div class="right">
      ${form.summary ? `<div class="section"><div class="section-title">О себе</div><p class="text">${escHtml(form.summary)}</p></div>` : ''}
      ${form.experience.length ? `<div class="section"><div class="section-title">Опыт работы</div>${form.experience.map((e) => `<div class="exp-item"><p class="text">${escHtml(e)}</p></div>`).join('')}</div>` : ''}
      ${form.education ? `<div class="section"><div class="section-title">Образование</div><p class="text">${escHtml(form.education)}</p></div>` : ''}
    </div>
  </div>
  <div class="footer">Резюме сгенерировано платформой Career Intelligence Platform • МАДИ</div>
</div>
</body></html>`
   }

   const generateMinimalHtml = (): string => {
      const contacts = [form.email, form.city, form.phone, form.telegram].filter(
         (v) => v && v !== 'не указан' && v !== 'placeholder@email.com',
      )

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Резюме</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Helvetica Neue','Arial',sans-serif; background:white; color:#222; line-height:1.7; padding:60px 70px; max-width:760px; margin:0 auto; font-size:13px; }
h1 { font-size:26px; font-weight:400; letter-spacing:-0.5px; color:#111; margin-bottom:4px; }
.pos { font-size:13px; color:#777; margin-bottom:16px; }
.contacts-line { font-size:12px; color:#999; margin-bottom:30px; letter-spacing:0.01em; }
.contacts-line span::after { content:' · '; }
.contacts-line span:last-child::after { content:''; }
.section { margin-bottom:28px; }
.section-title { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:#bbb; margin-bottom:10px; }
.divider { height:1px; background:#f0f0f0; margin-bottom:14px; }
p { font-size:13px; color:#444; line-height:1.7; }
.skills { display:flex; flex-wrap:wrap; gap:5px; }
.skill { font-size:12px; color:#555; border:1px solid #e8e8e8; padding:3px 9px; border-radius:3px; }
.exp-item { margin-bottom:16px; }
.exp-desc { font-size:13px; color:#444; line-height:1.6; }
.footer { margin-top:44px; font-size:10px; color:#ccc; text-align:right; }
@page { size:A4; margin:0; }
</style></head><body>
<h1>${escHtml(form.name || 'Кандидат')}</h1>
${form.targetPosition ? `<div class="pos">${escHtml(form.targetPosition)}</div>` : ''}
${contacts.length ? `<div class="contacts-line">${contacts.map((c) => `<span>${escHtml(c)}</span>`).join('')}</div>` : ''}
${form.summary ? `<div class="section"><div class="section-title">О себе</div><div class="divider"></div><p>${escHtml(form.summary)}</p></div>` : ''}
${form.hardSkills.length ? `<div class="section"><div class="section-title">Навыки</div><div class="divider"></div><div class="skills">${form.hardSkills.map((s) => `<span class="skill">${escHtml(s)}</span>`).join('')}</div></div>` : ''}
${form.softSkills.length ? `<div class="section"><div class="section-title">Личные качества</div><div class="divider"></div><div class="skills">${form.softSkills.map((s) => `<span class="skill">${escHtml(s)}</span>`).join('')}</div></div>` : ''}
${form.experience.length ? `<div class="section"><div class="section-title">Опыт</div><div class="divider"></div>${form.experience.map((e) => `<div class="exp-item"><p class="exp-desc">${escHtml(e)}</p></div>`).join('')}</div>` : ''}
${form.education ? `<div class="section"><div class="section-title">Образование</div><div class="divider"></div><p>${escHtml(form.education)}</p></div>` : ''}
<div class="footer">Career Intelligence Platform</div>
</body></html>`
   }

   const handleDownloadPdf = () => {
      let html: string
      if (template === 'classic') html = generateClassicHtml()
      else if (template === 'modern') html = generateModernHtml()
      else html = generateMinimalHtml()

      const element = document.createElement('div')
      element.innerHTML = html
      document.body.appendChild(element)

      import('html2pdf.js').then((html2pdfModule: any) => {
         const html2pdf = html2pdfModule.default
         html2pdf()
            .from(element)
            .set({
               margin: 0,
               filename: `Резюме_${(form.name || 'Кандидат').replace(/\s+/g, '_')}.pdf`,
               image: { type: 'jpeg', quality: 0.98 },
               html2canvas: { scale: 2, useCORS: true, logging: false },
               jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .save()
            .then(() => document.body.removeChild(element))
            .catch((err: any) => {
               console.error('PDF error:', err)
               document.body.removeChild(element)
            })
      })
   }

   if (loading)
      return (
         <div className="editor-loading">
            <div className="editor-spinner" />
            <p>Загрузка резюме...</p>
         </div>
      )

   const goBack = () =>
      navigate(resumeSessionId ? `/main?sessionId=${resumeSessionId}` : '/main')

   if (error)
      return (
         <div className="editor-loading">
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <button onClick={goBack} className="editor-btn-back">
               ← Вернуться в чат
            </button>
         </div>
      )

   return (
      <div className="editor-layout">
         {/* Header */}
         <div className="editor-header">
            <button className="editor-btn-back" onClick={goBack}>
               ← Назад
            </button>
            <span className="editor-title">Редактор резюме</span>
            <div className="editor-header-actions">
               <select
                  className="template-select"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as Template)}
               >
                  <option value="classic">Классический</option>
                  <option value="modern">Современный</option>
                  <option value="minimal">Минималист</option>
               </select>
               <button onClick={handleSave} className="editor-btn-save">
                  {saved ? '✓ Сохранено' : 'Сохранить'}
               </button>
               <button onClick={handleDownloadPdf} className="editor-btn-pdf">
                  ↓ Скачать PDF
               </button>
            </div>
         </div>

         {/* Body */}
         <div className="editor-body">
            {/* Left: Form */}
            <div className="editor-form-col">
               <div className="editor-section">
                  <div className="editor-section-title">Основная информация</div>
                  <div className="editor-field">
                     <label>Имя</label>
                     <input
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Иванов Иван"
                     />
                  </div>
                  <div className="editor-field">
                     <label>Целевая позиция</label>
                     <input
                        value={form.targetPosition}
                        onChange={(e) => update('targetPosition', e.target.value)}
                        placeholder="Frontend Developer"
                     />
                  </div>
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">Контакты</div>
                  <div className="editor-field">
                     <label>Email</label>
                     <input
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="example@email.com"
                     />
                  </div>
                  <div className="editor-field">
                     <label>Город</label>
                     <input
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        placeholder="Москва"
                     />
                  </div>
                  <div className="editor-field">
                     <label>Телефон</label>
                     <input
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="+7 999 123-45-67"
                     />
                  </div>
                  <div className="editor-field">
                     <label>Telegram</label>
                     <input
                        value={form.telegram}
                        onChange={(e) => update('telegram', e.target.value)}
                        placeholder="@username"
                     />
                  </div>
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">О себе</div>
                  <div className="editor-field">
                     <textarea
                        value={form.summary}
                        onChange={(e) => update('summary', e.target.value)}
                        placeholder="Краткое описание профессионального опыта..."
                        rows={4}
                     />
                  </div>
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">Hard Skills</div>
                  <TagInput
                     tags={form.hardSkills}
                     onChange={(tags) => update('hardSkills', tags)}
                     placeholder="Добавить навык (Enter)"
                  />
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">Soft Skills</div>
                  <TagInput
                     tags={form.softSkills}
                     onChange={(tags) => update('softSkills', tags)}
                     placeholder="Добавить качество (Enter)"
                  />
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">Образование</div>
                  <div className="editor-field">
                     <textarea
                        value={form.education}
                        onChange={(e) => update('education', e.target.value)}
                        placeholder="МГУ, Информатика, 2020"
                        rows={3}
                     />
                  </div>
               </div>

               <div className="editor-section">
                  <div className="editor-section-title">Опыт работы</div>
                  {form.experience.map((exp, i) => (
                     <div key={i} className="exp-block">
                        <textarea
                           value={exp}
                           onChange={(e) => {
                              const updated = [...form.experience]
                              updated[i] = e.target.value
                              update('experience', updated)
                           }}
                           rows={3}
                        />
                        <button
                           className="exp-remove-btn"
                           onClick={() =>
                              update(
                                 'experience',
                                 form.experience.filter((_, idx) => idx !== i),
                              )
                           }
                        >
                           Удалить
                        </button>
                     </div>
                  ))}
                  <div className="exp-add-row">
                     <textarea
                        value={newExpBlock}
                        onChange={(e) => setNewExpBlock(e.target.value)}
                        placeholder="Описание места работы..."
                        rows={2}
                     />
                     <button
                        className="editor-btn-add"
                        onClick={() => {
                           if (newExpBlock.trim()) {
                              update('experience', [
                                 ...form.experience,
                                 newExpBlock.trim(),
                              ])
                              setNewExpBlock('')
                           }
                        }}
                     >
                        + Добавить
                     </button>
                  </div>
               </div>
            </div>

            {/* Right: Live Preview */}
            <div className="editor-preview-col">
               <div className="editor-preview-label">Предпросмотр</div>
               <div className="editor-preview">
                  <div className="preview-name">
                     {form.name || 'Имя не указано'}
                  </div>
                  {form.targetPosition && (
                     <div className="preview-position">{form.targetPosition}</div>
                  )}
                  <div className="preview-contacts">
                     {form.email && <span>Email: {form.email}</span>}
                     {form.city && <span>Город: {form.city}</span>}
                     {form.phone && <span>Тел: {form.phone}</span>}
                     {form.telegram && <span>Telegram: {form.telegram}</span>}
                  </div>

                  {form.summary && (
                     <div className="preview-section">
                        <div className="preview-section-title">О себе</div>
                        <p>{form.summary}</p>
                     </div>
                  )}

                  {form.hardSkills.length > 0 && (
                     <div className="preview-section">
                        <div className="preview-section-title">Навыки</div>
                        <div className="preview-tags">
                           {form.hardSkills.map((s, i) => (
                              <span key={i} className="preview-tag">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {form.softSkills.length > 0 && (
                     <div className="preview-section">
                        <div className="preview-section-title">
                           Личные качества
                        </div>
                        <div className="preview-tags">
                           {form.softSkills.map((s, i) => (
                              <span key={i} className="preview-tag soft">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {form.experience.length > 0 && (
                     <div className="preview-section">
                        <div className="preview-section-title">Опыт работы</div>
                        {form.experience.map((e, i) => (
                           <p key={i} className="preview-exp">
                              {e}
                           </p>
                        ))}
                     </div>
                  )}

                  {form.education && (
                     <div className="preview-section">
                        <div className="preview-section-title">Образование</div>
                        <p>{form.education}</p>
                     </div>
                  )}

                  {analysis && (
                     <div className="preview-section preview-analysis">
                        <div className="preview-section-title">
                           Карьерный анализ
                        </div>
                        {analysis.currentPosition && (
                           <p>
                              <strong>Позиция сейчас:</strong>{' '}
                              {analysis.currentPosition}
                           </p>
                        )}
                        {formatSalary(
                           analysis.currentSalaryMin,
                           analysis.currentSalaryMax,
                        ) && (
                           <p>
                              <strong>Зарплата сейчас:</strong>{' '}
                              {formatSalary(
                                 analysis.currentSalaryMin,
                                 analysis.currentSalaryMax,
                              )}
                           </p>
                        )}
                        {analysis.futurePosition && (
                           <p>
                              <strong>Через 6–12 мес:</strong>{' '}
                              {analysis.futurePosition}
                           </p>
                        )}
                        {formatSalary(
                           analysis.futureSalaryMin,
                           analysis.futureSalaryMax,
                        ) && (
                           <p>
                              <strong>Зарплата в будущем:</strong>{' '}
                              {formatSalary(
                                 analysis.futureSalaryMin,
                                 analysis.futureSalaryMax,
                              )}
                           </p>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}

export default ResumeEditor
