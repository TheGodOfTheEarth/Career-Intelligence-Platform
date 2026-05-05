import { useState, useEffect } from 'react'
import './HiPage.css'
import { useNavigate } from 'react-router-dom'

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{question}</span>
        <span className="faq-arrow">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'Это бесплатно?',
    a: 'Базовый функционал полностью бесплатен. Создавай резюме и получай карьерный анализ без оплаты.',
  },
  {
    q: 'Как ИИ анализирует мои навыки?',
    a: 'Ты отвечаешь на вопросы в чате, ИИ собирает данные и сравнивает их с требованиями рынка труда.',
  },
  {
    q: 'Можно ли отредактировать резюме после генерации?',
    a: 'Да, после генерации доступен визуальный редактор с тремя шаблонами оформления.',
  },
  {
    q: 'В каком формате можно скачать резюме?',
    a: 'Резюме выгружается в формате PDF с выбором стиля оформления.',
  },
]

function HiPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.title = 'CarIP — ИИ помощник для карьеры'
  }, [])

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          Car<span>IP</span>
        </div>
        <div className={`nav-actions${mobileMenuOpen ? ' open' : ''}`}>
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            Войти
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Зарегистрироваться
          </button>
        </div>
        <button
          className="nav-burger"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-badge">◆ ИИ-платформа для карьерного роста</div>
        <h1>
          Создай резюме с помощью{' '}
          <span className="highlight">искусственного интеллекта</span>
        </h1>
        <p className="hero-subtitle">
          Платформа, которая анализирует твои навыки, строит карьерный план
          и показывает путь к нужной должности
        </p>
        <button className="hero-cta" onClick={() => navigate('/register')}>
          Начать бесплатно →
        </button>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-label">Возможности</div>
        <h2 className="section-title">Всё что нужно для карьеры</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">AI</div>
            <h3>ИИ-анализ навыков</h3>
            <p>
              Умный алгоритм оценивает твои компетенции и сравнивает с
              требованиями рынка
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">CV</div>
            <h3>Готовое резюме за 5 минут</h3>
            <p>
              Просто ответь на вопросы — ИИ сформирует профессиональное резюме
              и выгрузит PDF
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">↑$</div>
            <h3>Карьерный план и зарплатные вилки</h3>
            <p>
              Узнай текущую рыночную стоимость и получи конкретный план роста с
              реальными цифрами
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">5 мин</div>
            <div className="stat-label">до готового резюме</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3 шаблона</div>
            <div className="stat-label">PDF на выбор</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">ИИ</div>
            <div className="stat-label">анализирует навыки</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">бесплатно</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="section-label">Как это работает</div>
        <h2 className="section-title">Три шага до результата</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Зарегистрируйся</h3>
              <p>Создай аккаунт за минуту — только имя, email и пароль</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Пообщайся с ИИ</h3>
              <p>Расскажи о своём опыте, навыках и целях в удобном чате</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Получи результат</h3>
              <p>
                Скачай готовое резюме и получи персональный карьерный анализ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <div className="section-label">Тарифы</div>
        <h2 className="section-title">Выбери свой план</h2>
        <p className="pricing-subtitle">Начни бесплатно, расти вместе с платформой</p>
        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-name">Бесплатно</div>
            <div className="pricing-price">
              <div className="pricing-price-value">0 ₽</div>
              <div className="pricing-price-period">в месяц</div>
            </div>
            <ul className="pricing-features">
              <li>Базовый анализ резюме</li>
              <li>1 резюме в месяц</li>
              <li>PDF выгрузка</li>
              <li>Карьерный анализ</li>
            </ul>
            <button className="pricing-btn" onClick={() => navigate('/register')}>
              Начать бесплатно
            </button>
          </div>
          {/* PRO */}
          <div className="pricing-card featured">
            <div className="pricing-badge">Популярный</div>
            <div className="pricing-name">Pro</div>
            <div className="pricing-price">
              <div className="pricing-price-value">499 ₽</div>
              <div className="pricing-price-period">в месяц</div>
            </div>
            <ul className="pricing-features">
              <li>Всё из Free</li>
              <li>Неограниченные резюме</li>
              <li>Детальные чек-листы навыков</li>
              <li>Персональный roadmap</li>
              <li>Рекомендации курсов</li>
              <li>Приоритетная поддержка</li>
            </ul>
            <button className="pricing-btn featured" onClick={() => navigate('/register')}>
              Попробовать Pro
            </button>
          </div>
          {/* BUSINESS */}
          <div className="pricing-card">
            <div className="pricing-name">Business</div>
            <div className="pricing-price">
              <div className="pricing-price-value">2 990 ₽</div>
              <div className="pricing-price-period">от / в месяц</div>
            </div>
            <ul className="pricing-features">
              <li>Всё из Pro</li>
              <li>До 50 пользователей</li>
              <li>Для университетов и компаний</li>
              <li>HR аналитика</li>
              <li>API доступ</li>
              <li>Персональный менеджер</li>
            </ul>
            <button className="pricing-btn" onClick={() => navigate('/login')}>
              Связаться с нами
            </button>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="partners">
        <div className="section-label">Экосистема</div>
        <h2 className="section-title">Лучшие образовательные платформы</h2>
        <p className="partners-subtitle">
          Платформа рекомендует лучшие курсы от ведущих образовательных
          платформ для достижения ваших карьерных целей
        </p>
        <div className="partners-grid">
          <div className="partner-badge">Coursera</div>
          <div className="partner-badge">Stepik</div>
          <div className="partner-badge">Яндекс Практикум</div>
          <div className="partner-badge">Skillbox</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Готов выстроить карьеру с умом?</h2>
        <p>Присоединяйся и начни бесплатно прямо сейчас</p>
        <div className="cta-buttons">
          <button
            className="btn-cta-primary"
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </button>
          <button className="btn-cta-ghost" onClick={() => navigate('/login')}>
            Уже есть аккаунт
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>Часто задаваемые вопросы</h2>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>Бажанов Юрий, 2бАСУ1 · +79779919703</div>
        <div>Проект кафедры АСУ 09.03.01</div>
        <div>
          <a
            href="https://vk.com/club236966262"
            target="_blank"
            rel="noreferrer"
          >
            vk.com/club236966262
          </a>
        </div>
      </footer>
    </div>
  )
}

export default HiPage
