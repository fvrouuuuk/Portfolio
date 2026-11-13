import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Download,
  Globe2,
  Mail,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import portrait from './assets/portrait.jpg'
import { copy } from './data/copy'
import { contact, education, experience, expertise, languages, projects, type Language, type Project } from './data/portfolio'

gsap.registerPlugin(ScrollTrigger)

const Scene = lazy(() => import('./components/Scene'))

const sections = ['home', 'about', 'expertise', 'projects', 'journey', 'contact'] as const
type SectionId = (typeof sections)[number]

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reducedMotion
}

function usePerformanceTier() {
  const readTier = () => {
    const device = navigator as Navigator & { deviceMemory?: number }
    const mobile = window.matchMedia('(max-width: 760px)').matches || window.matchMedia('(pointer: coarse)').matches
    const cores = navigator.hardwareConcurrency || 8
    const memory = device.deviceMemory || 8
    return { lowPower: mobile || cores <= 4 || memory <= 4, mobile }
  }
  const [tier, setTier] = useState(readTier)
  useEffect(() => {
    const update = () => setTier(readTier())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return tier
}

function useScrollProgress(progressRef: { current: number }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const value = Math.min(1, Math.max(0, window.scrollY / maxScroll))
        progressRef.current = value
        setProgress(value)
        ScrollTrigger.update()
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [progressRef])
  return progress
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSection(visible.target.id as SectionId)
    }, { rootMargin: '-24% 0px -52% 0px', threshold: [0.05, 0.2, 0.45] })
    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])
  return activeSection
}

function useRevealAnimations(reducedMotion: boolean) {
  useLayoutEffect(() => {
    if (reducedMotion) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.fromTo(element, { y: 28, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        })
      })
    })
    return () => context.revert()
  }, [reducedMotion])
}

function SmoothScroll({ reducedMotion }: { reducedMotion: boolean }) {
  useEffect(() => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true, wheelMultiplier: 0.9 })
    const update = (time: number) => lenis.raf(time * 1000)
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [reducedMotion])
  return null
}

function MagneticLinks() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const cleanups: Array<() => void> = []
    items.forEach((item) => {
      const move = (event: PointerEvent) => {
        const rect = item.getBoundingClientRect()
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height
        item.style.transform = `translate3d(${x * 8}px, ${y * 7}px, 0)`
      }
      const leave = () => { item.style.transform = '' }
      item.addEventListener('pointermove', move)
      item.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        item.removeEventListener('pointermove', move)
        item.removeEventListener('pointerleave', leave)
      })
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])
  return null
}

function Cursor({ language }: { language: Language }) {
  const dot = useRef<HTMLSpanElement>(null)
  const halo = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('custom-cursor-enabled')
    const move = (event: PointerEvent) => {
      const transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      if (dot.current) dot.current.style.transform = transform
      if (halo.current) halo.current.style.transform = transform
    }
    const over = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      halo.current?.classList.toggle('cursor-halo--active', Boolean(target))
      if (label.current) {
        label.current.textContent = target?.dataset.cursor === 'project' ? copy[language].cursor.view : target ? copy[language].cursor.explore : ''
        label.current.classList.toggle('cursor-label--visible', Boolean(target?.dataset.cursor === 'project'))
        label.current.style.transform = `translate3d(${event.clientX + 20}px, ${event.clientY - 12}px, 0)`
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
    }
  }, [language])
  return (
    <div className="custom-cursor" aria-hidden="true">
      <span ref={dot} className="cursor-dot" />
      <span ref={halo} className="cursor-halo" />
      <span ref={label} className="cursor-label" />
    </div>
  )
}

function Intro({ onComplete, language }: { onComplete: () => void; language: Language }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const value = Math.min(100, Math.round(((now - start) / 4300) * 100))
      setProgress(value)
      if (value < 100) frame = requestAnimationFrame(animate)
      else window.setTimeout(onComplete, 260)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [onComplete])
  return (
    <div className="intro" role="status" aria-live="polite">
      <div className="intro-aurora" aria-hidden="true" />
      <div className="intro-content">
        <span className="intro-kicker">{copy[language].intro.label}</span>
        <span className="intro-number">{String(progress).padStart(3, '0')}<i>%</i></span>
        <span className="intro-name">FAROUK AYOUNA</span>
        <span className="intro-progress"><i style={{ transform: `scaleX(${progress / 100})` }} /></span>
      </div>
      <button className="intro-skip" type="button" onClick={onComplete} data-magnetic>
        {copy[language].intro.skip} <ArrowRight size={14} />
      </button>
    </div>
  )
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return <div className="section-label"><span>{number}</span><span>{label}</span><i aria-hidden="true" /></div>
}

function SectionHeading({ id, eyebrow, titleA, titleB, aside }: { id?: string; eyebrow: string; titleA: string; titleB: string; aside?: string }) {
  return (
    <div className="section-heading reveal">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{titleA}<br /><em>{titleB}</em></h2>
      </div>
      {aside && <p className="section-aside">{aside}</p>}
    </div>
  )
}

function Navbar({ language, setLanguage, activeSection, menuOpen, setMenuOpen }: {
  language: Language
  setLanguage: (value: Language) => void
  activeSection: SectionId
  menuOpen: boolean
  setMenuOpen: (value: boolean) => void
}) {
  const t = copy[language]
  const navItems: Array<{ id: SectionId; label: string }> = [
    { id: 'about', label: t.nav.about },
    { id: 'expertise', label: t.nav.expertise },
    { id: 'projects', label: t.nav.projects },
    { id: 'journey', label: t.nav.journey },
    { id: 'contact', label: t.nav.contact },
  ]
  const cv = language === 'fr' ? '/farouk-ayouna-cv-fr.pdf' : '/farouk-ayouna-cv-en.pdf'
  return (
    <header className="site-header">
      <a className="brand-mark" href="#home" aria-label="Farouk Ayouna, accueil" data-magnetic>
        <img src={portrait} alt="" />
      </a>
      <a className="header-name" href="#home">FAROUK AYOUNA</a>
      <nav className={menuOpen ? 'primary-nav primary-nav--open' : 'primary-nav'} aria-label={language === 'fr' ? 'Navigation principale' : 'Main navigation'}>
        {navItems.map((item) => (
          <a key={item.id} className={activeSection === item.id ? 'nav-link nav-link--active' : 'nav-link'} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <a className="nav-cv" href={cv} download data-magnetic>
          <Download size={13} /> {t.nav.cv}
        </a>
      </nav>
      <div className="header-tools">
        <button className="language-switch" type="button" aria-label={language === 'fr' ? 'Switch language to English' : 'Changer la langue en français'} onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')} data-magnetic>
          <Globe2 size={14} /><span>{language.toUpperCase()}</span>
        </button>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? (language === 'fr' ? 'Fermer le menu' : 'Close menu') : (language === 'fr' ? 'Ouvrir le menu' : 'Open menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  )
}

function ProjectCard({ project, language, onOpen, onHover }: {
  project: Project
  language: Language
  onOpen: (project: Project) => void
  onHover: (project: Project | null) => void
}) {
  const t = copy[language]
  const style = { '--project-color': project.color } as CSSProperties
  const tilt = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -5
    const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 6
    event.currentTarget.style.setProperty('--tilt-x', `${rx}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${ry}deg`)
  }
  const resetTilt = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
    onHover(null)
  }
  return (
    <article className="project-card reveal" style={style} onPointerMove={tilt} onPointerEnter={() => onHover(project)} onPointerLeave={resetTilt}>
      <button className="project-card__open" type="button" onClick={() => onOpen(project)} data-cursor="project" aria-label={`${t.projects.open}: ${project.title}`}>
        <span className="project-art" aria-hidden="true">
          <span className="project-art__index">{project.number} / 06</span>
          <span className="project-art__wordmark">{project.initials}</span>
          <span className="project-art__orbit project-art__orbit--a" />
          <span className="project-art__orbit project-art__orbit--b" />
          <span className="project-art__code">&lt; / &gt;</span>
          <span className="project-art__caption">{project.category[language]}</span>
        </span>
        <span className="project-card__body">
          <span className="project-card__topline"><span>{project.number}</span><span>{t.projects.private}</span></span>
          <span className="project-card__title">{project.title}</span>
          <span className="project-card__description">{project.description[language]}</span>
          <span className="project-card__stack">{project.technologies.join(' · ')}</span>
          <span className="project-card__action">{t.projects.open} <ArrowUpRight size={14} /></span>
        </span>
      </button>
    </article>
  )
}

function ProjectDialog({ project, language, onClose }: { project: Project | null; language: Language; onClose: () => void }) {
  const t = copy[language]
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!project) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [onClose, project])
  if (!project) return null
  const style = { '--project-color': project.color } as CSSProperties
  return (
    <div className="project-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section ref={dialogRef} className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-description" style={style}>
        <button ref={closeButtonRef} className="project-dialog__close" type="button" aria-label={t.projects.close} onClick={onClose}><X size={18} /></button>
        <div className="project-dialog__visual" aria-hidden="true">
          <span className="project-dialog__index">{project.number} / 06</span>
          <span className="project-dialog__wordmark">{project.initials}</span>
          <span className="project-dialog__orb project-dialog__orb--a" />
          <span className="project-dialog__orb project-dialog__orb--b" />
        </div>
        <div className="project-dialog__content">
          <p className="eyebrow">{project.category[language]}</p>
          <h2 id="project-dialog-title">{project.title}</h2>
          <p id="project-dialog-description" className="project-dialog__description">{project.details[language]}</p>
          <p className="dialog-label">{t.projects.stack}</p>
          <div className="tag-list">{project.technologies.map((technology) => <span key={technology} className="tech-tag">{technology}</span>)}</div>
          <p className="private-note"><span />{t.projects.private}</p>
        </div>
      </section>
    </div>
  )
}

function MobileLaptop() {
  return (
    <div className="mobile-laptop" aria-hidden="true">
      <span className="mobile-laptop__screen"><i>&lt; / &gt;</i><b>FA</b></span>
      <span className="mobile-laptop__base" />
    </div>
  )
}

function App() {
  const reducedMotion = useReducedMotion()
  const { lowPower, mobile } = usePerformanceTier()
  const progressRef = useRef(0)
  const focusRef = useRef(0)
  const scrollProgress = useScrollProgress(progressRef)
  const activeSection = useActiveSection()
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('farouk-language') === 'en' ? 'en' : 'fr'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [introVisible, setIntroVisible] = useState(false)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const t = copy[language]

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('farouk-language', language)
    document.title = language === 'fr' ? 'Farouk Ayouna — Développeur full-stack' : 'Farouk Ayouna — Full-stack developer'
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'fr'
      ? 'Farouk Ayouna — développeur full-stack web et logiciel. Découvrez ses projets, son parcours et ses domaines d’expertise.'
      : 'Farouk Ayouna — full-stack web and software developer. Explore his projects, experience, and areas of expertise.')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', language === 'fr'
      ? 'Développement web et logiciel, interfaces soignées et systèmes utiles.'
      : 'Web and software development, considered interfaces, and useful systems.')
  }, [language])

  useEffect(() => {
    const seen = sessionStorage.getItem('farouk-intro-seen') === 'true'
    setIntroVisible(!seen && !reducedMotion)
  }, [reducedMotion])

  const completeIntro = useCallback(() => {
    sessionStorage.setItem('farouk-intro-seen', 'true')
    setIntroVisible(false)
  }, [])
  const closeProject = useCallback(() => setSelectedProject(null), [])

  useEffect(() => { focusRef.current = selectedProject ? 1 : 0 }, [selectedProject])
  useRevealAnimations(reducedMotion)

  return (
    <>
      <SmoothScroll reducedMotion={reducedMotion} />
      <MagneticLinks />
      <div className="story-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <div className="scene-shell" aria-hidden="true">
        {mobile ? <div className="scene-fallback" /> : (
          <Suspense fallback={<div className="scene-fallback" />}>
            <Scene
              progress={progressRef}
              focus={focusRef}
              section={activeSection}
              language={language}
              activeProject={selectedProject?.id ?? hoveredProject?.id ?? null}
              lowPower={lowPower}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        )}
        <div className="scene-edge-glow" />
      </div>
      <Cursor language={language} />
      <Navbar language={language} setLanguage={setLanguage} activeSection={activeSection} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main id="story">
        <section className="hero section-shell" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" />{t.hero.eyebrow}</p>
            <h1 id="hero-title"><span>{t.hero.titleA}</span><br /><span>{t.hero.titleB}</span><br /><em>{t.hero.titleC}</em></h1>
            <p className="hero-intro">{t.hero.body}</p>
            <div className="hero-actions">
              <a className="button button--solid" href="#projects" data-magnetic data-cursor="explore">{t.hero.primary}<ArrowDownRight size={16} /></a>
              <a className="text-link" href="#contact" data-magnetic>{t.hero.secondary}<ArrowUpRight size={14} /></a>
            </div>
          </div>
          <MobileLaptop />
          <a className="scroll-cue" href="#about"><span>{t.hero.scroll}</span><ArrowDown size={14} /></a>
        </section>

        <section className="about section-shell story-section" id="about" aria-labelledby="about-title">
          <SectionLabel number="01" label={t.about.label} />
          <div className="content-zone content-zone--left">
            <div className="about-copy reveal">
              <p className="eyebrow">{t.about.eyebrow}</p>
              <h2 id="about-title">{t.about.titleA}<br /><em>{t.about.titleB}</em></h2>
              <p>{t.about.paragraphA}</p>
              <p>{t.about.paragraphB}</p>
              <div className="about-tags">{t.about.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="about-coordinate reveal"><Sparkles size={14} /><span>{t.about.orb}</span><span>02</span></div>
          </div>
        </section>

        <section className="expertise section-shell story-section" id="expertise" aria-labelledby="expertise-title">
          <SectionLabel number="02" label={t.expertise.label} />
          <div className="content-zone content-zone--left">
            <SectionHeading id="expertise-title" eyebrow={t.expertise.eyebrow} titleA={t.expertise.titleA} titleB={t.expertise.titleB} aside={t.expertise.aside} />
            <div className="expertise-list">
              {expertise.map((item) => (
                <article className="expertise-row reveal" key={item.number}>
                  <span className="row-number">{item.number}</span>
                  <div className="expertise-title"><h3>{item.title[language]}</h3><p>{item.description[language]}</p></div>
                  <div className="tag-list">{item.technologies.map((technology) => <span className="tech-tag" key={technology}>{technology === 'Temps réel' && language === 'en' ? 'Real-time' : technology}</span>)}</div>
                  <ArrowUpRight className="row-arrow" size={16} />
                </article>
              ))}
            </div>
            <div className="expertise-footnote reveal"><Code2 size={14} />{t.expertise.foot}</div>
          </div>
        </section>

        <section className="projects section-shell story-section" id="projects" aria-labelledby="projects-title">
          <SectionLabel number="03" label={t.projects.label} />
          <div className="content-zone content-zone--projects">
            <SectionHeading id="projects-title" eyebrow={t.projects.eyebrow} titleA={t.projects.titleA} titleB={t.projects.titleB} aside={t.projects.aside} />
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} language={language} onOpen={setSelectedProject} onHover={setHoveredProject} />
              ))}
            </div>
            <p className="projects-note"><span />{t.projects.note}</p>
          </div>
        </section>

        <section className="journey section-shell story-section" id="journey" aria-labelledby="journey-title">
          <SectionLabel number="04" label={t.journey.label} />
          <div className="content-zone content-zone--left">
            <SectionHeading id="journey-title" eyebrow={t.journey.eyebrow} titleA={t.journey.titleA} titleB={t.journey.titleB} />
            <div className="journey-grid">
              <div className="journey-column reveal">
                <h3 className="column-heading"><span>01</span>{t.journey.experience}</h3>
                <div className="timeline-list">
                  {experience.map((item) => (
                    <article className="timeline-entry" key={item.organization}>
                      <span className="timeline-period">{item.period[language]}</span>
                      <div><h4>{item.role[language]}</h4><p className="timeline-org">{item.organization}</p><p>{item.details[language]}</p></div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="journey-column reveal">
                <h3 className="column-heading"><span>02</span>{t.journey.education}</h3>
                <div className="timeline-list">
                  {education.map((item) => (
                    <article className="timeline-entry" key={item.title.en}>
                      <span className="timeline-period">{item.period}</span>
                      <div><h4>{item.title[language]}</h4><p>{item.detail[language]}</p></div>
                    </article>
                  ))}
                </div>
                <h3 className="column-heading language-heading"><span>03</span>{t.journey.language}</h3>
                <div className="language-list">
                  {languages.map((item) => <div key={item.name.en}><span>{item.name[language]}</span><i>{typeof item.level === 'string' ? item.level : item.level[language]}</i></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contact section-shell story-section" id="contact" aria-labelledby="contact-title">
          <SectionLabel number="05" label={t.contact.label} />
          <div className="content-zone content-zone--contact">
            <div className="contact-panel reveal">
              <div className="contact-copy">
                <p className="eyebrow">{t.contact.eyebrow}</p>
                <h2 id="contact-title">{t.contact.titleA}<br /><em>{t.contact.titleB}</em></h2>
                <p className="contact-body">{t.contact.body}</p>
                <a className="email-link" href={`mailto:${contact.email}`} data-magnetic data-cursor="explore"><Mail size={17} />{contact.email}<ArrowUpRight size={16} /></a>
              </div>
              <div className="contact-aside">
                <p className="contact-aside__label">{t.contact.links}</p>
                <div className="social-links">
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" data-magnetic><span className="network-mark">in</span>LinkedIn<ArrowUpRight size={13} /></a>
                  <a href={contact.github} target="_blank" rel="noreferrer" data-magnetic><span className="network-mark network-mark--github">gh</span>GitHub<ArrowUpRight size={13} /></a>
                </div>
                <p className="contact-aside__label phone-label">{t.contact.phone}</p>
                <a className="phone-link" href={`tel:${contact.phone.replaceAll(' ', '')}`}>{contact.phone}</a>
                <a className="button button--glass contact-cv" href={language === 'fr' ? '/farouk-ayouna-cv-fr.pdf' : '/farouk-ayouna-cv-en.pdf'} download data-magnetic><Download size={15} />{t.nav.cv}</a>
              </div>
              <span className="contact-watermark" aria-hidden="true">FA</span>
            </div>
          </div>
          <footer className="site-footer">
            <a href="#home" className="footer-brand">FAROUK AYOUNA<span>.</span></a>
            <span>{t.contact.footer} · 2026</span>
            <a href="#home" className="back-top">{t.contact.top}<ArrowRight size={13} /></a>
          </footer>
        </section>
      </main>

      <ProjectDialog project={selectedProject} language={language} onClose={closeProject} />
      {introVisible && <Intro onComplete={completeIntro} language={language} />}
    </>
  )
}

export default App
