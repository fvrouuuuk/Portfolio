export type Language = 'fr' | 'en'

export type Localized = {
  fr: string
  en: string
}

export type Project = {
  id: string
  number: string
  title: string
  category: Localized
  description: Localized
  details: Localized
  technologies: string[]
  color: string
  initials: string
}

export const projects: Project[] = [
  {
    id: 'webinaires',
    number: '01',
    title: 'Quarawain · Webinaires',
    category: { fr: 'Pages événementielles', en: 'Event pages' },
    description: {
      fr: 'Une série de pages thématiques pour les webinaires Quarawain, du QHSE à la science et à la technologie.',
      en: 'A series of themed landing pages for Quarawain webinars, from QHSE to science and technology.',
    },
    details: {
      fr: 'Neuf pages HTML autonomes présentent des webinaires autour de plusieurs thèmes. Les parcours mettent en avant les sujets et l’inscription à chaque événement.',
      en: 'Nine standalone HTML pages present webinars across several themes. Each page introduces its subject and event registration flow.',
    },
    technologies: ['HTML', 'CSS', 'JavaScript'],
    color: '#C58A67',
    initials: 'Q / W',
  },
  {
    id: 'root',
    number: '02',
    title: 'ROOT',
    category: { fr: 'Espace de gestion', en: 'Management workspace' },
    description: {
      fr: 'Un prototype d’espace de travail avec tableaux de bord, projets, tâches, messages et calendrier.',
      en: 'A workspace prototype with dashboards, projects, tasks, messages, and a calendar.',
    },
    details: {
      fr: 'Des vues employé et direction rassemblent les outils du quotidien. Les chiffres affichés dans l’interface sont des données de démonstration.',
      en: 'Employee and management views bring everyday tools together. Figures shown in the interface are demonstration data.',
    },
    technologies: ['React', 'TypeScript', 'Vite'],
    color: '#77A78C',
    initials: 'R.',
  },
  {
    id: 'securelog-ai',
    number: '03',
    title: 'SecureLog AI',
    category: { fr: 'Supervision de sécurité', en: 'Security monitoring' },
    description: {
      fr: 'Une console de supervision qui relie événements, règles SIEM, remédiation simulée et analyse statistique.',
      en: 'A monitoring console connecting security events, SIEM rules, simulated remediation, and statistical analysis.',
    },
    details: {
      fr: 'La plateforme collecte et filtre des événements, déclenche des alertes et propose des actions de remédiation applicative. Le moteur ML signale des anomalies statistiques, sans les présenter comme des attaques confirmées.',
      en: 'The platform collects and filters events, raises alerts, and offers application-level remediation actions. Its ML worker flags statistical anomalies without presenting them as confirmed attacks.',
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Python'],
    color: '#6D8DE1',
    initials: 'SL / AI',
  },
  {
    id: 'metafit',
    number: '04',
    title: 'MetaFit',
    category: { fr: 'Application Android', en: 'Android application' },
    description: {
      fr: 'Un suivi fitness et alimentation réunissant repas, activité, sommeil, hydratation et progression.',
      en: 'A fitness and nutrition tracker for meals, activity, sleep, hydration, and progress.',
    },
    details: {
      fr: 'L’application conserve les données localement, calcule des indicateurs à partir du profil et génère des plans localement ou avec l’API OpenAI, si une clé est fournie.',
      en: 'The app stores data locally, calculates indicators from a user profile, and generates plans locally or through the OpenAI API when a key is provided.',
    },
    technologies: ['Kotlin', 'Jetpack Compose', 'Room', 'OpenAI API'],
    color: '#A4B86F',
    initials: 'MF',
  },
  {
    id: 'quarawain-tech',
    number: '05',
    title: 'Quarawain Tech Advisory',
    category: { fr: 'Site de présentation', en: 'Company website' },
    description: {
      fr: 'Un site éditorial qui rassemble services, études, accompagnement et formations.',
      en: 'An editorial website bringing together services, studies, guidance, and training.',
    },
    details: {
      fr: 'La navigation relie des pages dédiées aux services, associations, études et webinaires, avec des transitions animées et une version française et anglaise.',
      en: 'Its navigation connects dedicated pages for services, associations, study paths, and webinars, with animated transitions and French and English content.',
    },
    technologies: ['React', 'GSAP', 'Lenis', 'Framer Motion'],
    color: '#B79B69',
    initials: 'Q / TA',
  },
  {
    id: 'securelog-advanced',
    number: '06',
    title: 'SecureLog Advanced',
    category: { fr: 'Plateforme sécurité · évolution', en: 'Security platform · evolution' },
    description: {
      fr: 'Une évolution de SecureLog avec espaces isolés, LifeGraph, Academy et copilote IA optionnel.',
      en: 'An evolution of SecureLog with isolated workspaces, LifeGraph, Academy, and an optional AI copilot.',
    },
    details: {
      fr: 'La plateforme étend la console de sécurité avec un espace de planification personnel, des parcours pédagogiques et un copilote qui n’envoie une demande qu’après consentement.',
      en: 'The platform extends the security console with personal planning, learning paths, and a copilot that only sends a request after explicit consent.',
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Python'],
    color: '#8C7BCB',
    initials: 'SL / X',
  },
]

export const expertise = [
  {
    number: '01',
    title: { fr: 'Interfaces web', en: 'Web interfaces' },
    description: {
      fr: 'Des interfaces structurées autour des usages et des besoins du produit.',
      en: 'Interfaces shaped around product needs and the way people use them.',
    },
    technologies: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Bootstrap'],
  },
  {
    number: '02',
    title: { fr: 'Services & données', en: 'Services & data' },
    description: {
      fr: 'Des services applicatifs, des intégrations et des systèmes connectés.',
      en: 'Application services, integrations, and connected systems.',
    },
    technologies: ['Node.js', 'NestJS', 'MySQL', 'PostgreSQL', 'Temps réel'],
  },
  {
    number: '03',
    title: { fr: 'Logiciels & conception', en: 'Software & design' },
    description: {
      fr: 'Applications desktop et modélisation de systèmes.',
      en: 'Desktop applications and systems modeling.',
    },
    technologies: ['Electron', 'C#', 'Java', 'UML', 'Merise', 'Git / GitHub'],
  },
]

export const experience = [
  {
    period: { fr: 'Mai - juillet 2026', en: 'May - July 2026' },
    organization: 'Quarawain Tech Advisory',
    role: { fr: 'Développement full-stack & design web', en: 'Full-stack development & web design' },
    details: { fr: 'Création d’applications mobiles et desktop.', en: 'Development of mobile and desktop applications.' },
  },
  {
    period: { fr: 'Mai - septembre 2026', en: 'May - September 2026' },
    organization: 'Entreprise Dar Niya',
    role: { fr: 'Manager · responsable de caisse', en: 'Manager · cashier manager' },
    details: { fr: 'Kénitra, Maroc.', en: 'Kenitra, Morocco.' },
  },
  {
    period: { fr: 'Juin - juillet 2025', en: 'June - July 2025' },
    organization: 'Workel',
    role: { fr: 'Stage · informatique et développement web', en: 'Internship · IT and web development' },
    details: { fr: 'Création d’une application desktop locale et intégration d’API.', en: 'Local desktop application development and API integration.' },
  },
]

export const education = [
  {
    period: '2024 - 2026',
    title: { fr: 'Développement des applications informatiques', en: 'Computer Application Development' },
    detail: { fr: 'BTS · DAI', en: 'BTS · DAI' },
  },
  {
    period: '2023 - 2024',
    title: { fr: 'Baccalauréat technique', en: 'Technical Baccalaureate' },
    detail: { fr: 'Filière mécanique', en: 'Mechanical engineering track' },
  },
]

export const languages = [
  { name: { fr: 'Français', en: 'French' }, level: 'C1' },
  { name: { fr: 'Arabe', en: 'Arabic' }, level: { fr: 'Langue maternelle', en: 'Native' } },
  { name: { fr: 'Anglais', en: 'English' }, level: { fr: 'Courant', en: 'Fluent' } },
  { name: { fr: 'Allemand', en: 'German' }, level: { fr: 'Amateur', en: 'Beginner' } },
]

export const contact = {
  email: 'ayounafarouk06@gmail.com',
  phone: '+212 06 23 19 19 20',
  linkedin: 'https://www.linkedin.com/in/ayouna-farouk-4aab273a6/',
  github: 'https://github.com/s4dntddb92-web',
}
