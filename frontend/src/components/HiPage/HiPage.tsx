import React, { useEffect, useLayoutEffect, useRef } from 'react'
import './HiPage.css'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import SplitText from 'gsap/src/SplitText'
import { ScrollTrigger } from 'gsap/all'

function HiPage() {
  const navigate = useNavigate()

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const text1Split = new SplitText('#text1', { type: 'chars, word' })
    const text2Split = new SplitText('#text2', { type: 'chars, word' })
    const descriptionSplit = new SplitText('#description1', {
      type: 'chars, words',
    })
    const aboutSplit = new SplitText('#about', { type: 'chars, word' })
    const panelDescription = new SplitText('#panelDescription', {
      type: 'chars, words',
    })
    const endText = new SplitText('#endText', {
      type: 'chars, words',
    })
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const finalChar = 'O'

    panelDescription.words.forEach((word, i) => {
      gsap.fromTo(
        word,
        { color: 'rgba(140,94,145,0.2)' },
        {
          color: '#8c5e91',
          scrollTrigger: {
            trigger: '#panelDescription',
            start: () => `top+=${i * 5}% 70%`,
            end: () => `bottom+=${(i + 1) * 10}% 80%`,
            scrub: true,
          },
        },
      )
    })

    const ctx = gsap.context(() => {
      const tlEnd = gsap.timeline({
        scrollTrigger: {
          trigger: '#endContainer',
          start: 'top top',
          end: 'bottom bottom',
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hiContainer',
          start: '-1% top',
          end: 'bottom bottom',
        },
      })

      tl.from(text1Split.chars, {
        yPercent: 100,
        opacity: 0,
        duration: 1.8,
        ease: 'expo.out',
        stagger: { amount: 1, from: 'end' },
      })
        .from(
          text2Split.chars,
          {
            xPercent: 100,
            opacity: 0,
            duration: 1.5,
            ease: 'power.out',
            stagger: { amount: 1, from: 'start' },
          },
          '-=2',
        )
        .from(
          descriptionSplit.words,
          {
            yPercent: 100,
            opacity: 0,
            duration: 1.5,
            ease: 'power1.out',
            stagger: { amount: 0.8, from: 'edges' },
          },
          '-=2',
        )

      tlEnd
        .fromTo(
          endText.chars,
          {
            yPercent: -700,
            color: 'transparent',
          },
          {
            yPercent: 0,
            color: 'wheat',
            duration: 2,
            ease: 'power1.out',
            yoyo: true,
            stagger: { amount: 0.8, from: 'start' },
          },
        )
        .from('#emailInput', { opacity: 0 })

      gsap.fromTo(
        aboutSplit.chars,
        {
          opacity: 0,
          y: 'random(-100,100)',
          x: 'random(-100,100)',
          scale: 0.3,
          ease: 'power1.out',
        },
        {
          y: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          filter: 'none',
          stagger: { grid: 'auto', from: 'start', amount: 1.2 },
        },
      )
    })

    return () => ctx.revert()
  }, [])
  return (
    <div className="login">
      <div className="scene" id="hiContainer">
        <div className="loginMenu layor">
          <button className="menuBurger">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                fill="wheat"
                d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"
              />
            </svg>
          </button>
          <div className="loginButtons">
            <button className="button auth" onClick={() => navigate('/login')}>
              Войти
            </button>
            <button
              className="button reg"
              onClick={() => navigate('/register')}
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
        <div className="contentWrapper layer bg">
          <p className="text1" id="text">
            <span id="text1">Добро</span> <span id="text2">пожаловать!</span>
          </p>
          <p className="descrition1" id="description1">
            Это ваш персональный ИИ агент для создания резюме
          </p>
        </div>
      </div>
      <div className="scene" id="mainContainer">
        <div className="mainContainerTexts layer bg">
          {/* <p id="about">ABOUT</p> */}
        </div>
        <div className="mainContainerPanel layer mid">
          <img src="resume.jpg" className="containerPhoto" alt="resume" />
          <p className="containerPanelDescription" id="panelDescription">
            Это — Career Intelligence Platform! Твой персональный карьерный
            конструктор. Создай идеальное резюме, получи предложения от компаний
            и узнай, какие навыки прокачать для роста зарплаты. Регистрация
            займёт минуту — начни выстраивать свою карьеру с умом!
          </p>
        </div>
      </div>
      <div className="scene" id="endContainer">
        <p className="endText layer bg" id="endText">
          Если ты хочешь присоедениться, авторизируйся
        </p>
        <div className="buttons">
          <button className="button auth" onClick={() => navigate('/login')}>
            Войти
          </button>
          <button className="button reg" onClick={() => navigate('/register')}>
            Зарегистрироваться
          </button>
        </div>
      </div>

      {/* <div className="cub1">
          <span ref={cub1} className="tipacub">
            LOXX
          </span>
        </div> */}
      {/* <div className="cub2" ref={cub2}></div> */}
      {/* <div className="cub2 cub20"></div>
        <div className="cub2 cub21"></div>
        <div className="cub2 cub22"></div>
        <div className="cub2 cub23"></div> */}
    </div>
  )
}

export default HiPage
//     tl.to('.cub2', {
//   y: 200,
//   duration: 1,
//   borderRadius: '100%',
//   rotation: 360,
//   ease: 'back.inOut',
//   stagger: { amount: 1.5, grid: [3, 2], axis: 'y', from: 'edges' },
// })

//     .to(cub3.current, {
//   x: 1900,
//   duration: 2,
//   rotation: 360,
//   scrollTrigger: {
//     trigger: cub3.current,
//     start: 'bottom, bottom',
//     markers: true,
//     end: 'top, 20%',
//     scrub: true,
//   },
// })

// aboutSplit.chars.forEach((char, i) => {
//   const finalChar = char.textContent || ''

//   gsap.fromTo(
//     char,
//     { opacity: 0, yPercent: 100 },
//     {
//       opacity: 1,
//       yPercent: 0,
//       duration: 1,
//       delay: i * 0.8,
//       scrollTrigger: {
//         trigger: '#about',
//         start: 'top 80%',
//       },
//       onUpdate: () => {
//         char.textContent = chars[Math.floor(Math.random() * chars.length)]
//       },
//       onComplete: () => {
//         char.textContent = finalChar
//       },
//     },
//   )
// })
