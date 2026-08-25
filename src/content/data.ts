import type { AllBodyContent } from './types'

/**
 * ─── PORTFOLIO CONTENT (PLACEHOLDERS) ──────────────────────────────────────
 * Single source of truth for everything shown inside the planet worlds.
 * Replace the placeholder copy below with real data — rendering, layout and
 * interaction all read from here and never need to change.
 * ───────────────────────────────────────────────────────────────────────────
 */
export const BODY_CONTENT: AllBodyContent = {
  sun: {
    intro: 'Start here — an overview of every destination in this solar system.',
    items: [
      {
        id: 'sun-earth',
        kind: 'node',
        title: 'Earth · Projects',
        subtitle: 'Destination gateway',
        description: [
          'Placeholder gateway beacon. In a future pass this will fly you straight to Earth to explore selected projects.',
        ],
      },
      {
        id: 'sun-mars',
        kind: 'node',
        title: 'Mars · Experience',
        subtitle: 'Destination gateway',
        description: ['Placeholder gateway beacon for the professional timeline on Mars.'],
      },
      {
        id: 'sun-jupiter',
        kind: 'node',
        title: 'Jupiter · Skills',
        subtitle: 'Destination gateway',
        description: ['Placeholder gateway beacon for the skill constellation inside Jupiter.'],
      },
      {
        id: 'sun-saturn',
        kind: 'node',
        title: 'Saturn · Certifications',
        subtitle: 'Destination gateway',
        description: ['Placeholder gateway beacon for certification medallions at Saturn.'],
      },
      {
        id: 'sun-mercury',
        kind: 'node',
        title: 'Mercury · Contact',
        subtitle: 'Destination gateway',
        description: ['Placeholder gateway beacon for direct contact channels on Mercury.'],
      },
    ],
  },

  mercury: {
    intro: 'Direct channels — pick a relay and start a transmission.',
    items: [
      {
        id: 'mercury-email',
        kind: 'beacon',
        title: 'Email Relay',
        subtitle: 'Direct line',
        description: ['Placeholder channel description — swap in your real address and preferred response time.'],
        link: { label: 'Open draft', href: '#' },
      },
      {
        id: 'mercury-github',
        kind: 'beacon',
        title: 'GitHub Relay',
        subtitle: 'Code',
        description: ['Placeholder channel description — link your profile and pin what visitors should see first.'],
        link: { label: 'Open profile', href: '#' },
      },
      {
        id: 'mercury-linkedin',
        kind: 'beacon',
        title: 'LinkedIn Relay',
        subtitle: 'Network',
        description: ['Placeholder channel description — connect professionally.'],
        link: { label: 'Open profile', href: '#' },
      },
    ],
  },

  venus: {
    intro: 'Kind words, sealed in capsules drifting through the cloud deck.',
    items: [
      {
        id: 'venus-capsule-1',
        kind: 'capsule',
        title: 'Capsule I',
        subtitle: 'From a colleague',
        period: '2025',
        tags: ['Collaboration'],
        description: ['Placeholder testimonial — two or three sentences about working together and what stood out.'],
      },
      {
        id: 'venus-capsule-2',
        kind: 'capsule',
        title: 'Capsule II',
        subtitle: 'From a client',
        period: '2025',
        tags: ['Delivery'],
        description: ['Placeholder testimonial describing outcomes, communication and reliability.'],
      },
      {
        id: 'venus-capsule-3',
        kind: 'capsule',
        title: 'Capsule III',
        subtitle: 'From a mentor',
        period: '2024',
        tags: ['Growth'],
        description: ['Placeholder testimonial about growth, craft and trajectory.'],
      },
    ],
  },

  earth: {
    intro: 'Selected work — open a pod to inspect a project.',
    items: [
      {
        id: 'earth-project-1',
        kind: 'pod',
        title: 'Project Aurora',
        subtitle: 'Web platform',
        period: '2026',
        tags: ['React', 'TypeScript', 'Three.js'],
        description: [
          'Placeholder case study. Describe the problem, your role, the approach and the measurable outcome.',
          'Second paragraph placeholder — architecture notes, interesting trade-offs, performance wins.',
        ],
        link: { label: 'Case study', href: '#' },
      },
      {
        id: 'earth-project-2',
        kind: 'pod',
        title: 'Project Borealis',
        subtitle: 'Data visualisation',
        period: '2025',
        tags: ['D3', 'Node.js'],
        description: ['Placeholder case study — what it does, who it serves, why it matters.'],
        link: { label: 'Live demo', href: '#' },
      },
      {
        id: 'earth-project-3',
        kind: 'pod',
        title: 'Project Terra',
        subtitle: 'Mobile app',
        period: '2024',
        tags: ['React Native'],
        description: ['Placeholder case study — scope, constraints, shipped result.'],
      },
      {
        id: 'earth-project-4',
        kind: 'pod',
        title: 'Project Helios',
        subtitle: 'Open source',
        period: '2024',
        tags: ['Rust', 'CLI'],
        description: ['Placeholder case study — problem space, adoption, lessons learned.'],
        link: { label: 'Repository', href: '#' },
      },
    ],
  },

  mars: {
    intro: 'A mission log of professional experience, in chronological order.',
    items: [
      {
        id: 'mars-entry-1',
        kind: 'marker',
        title: 'Senior Engineer',
        subtitle: 'Placeholder Corp',
        period: '2024 — Present',
        tags: ['Leadership', 'Platform'],
        description: ['Placeholder role summary — scope, team size, key deliveries and impact.'],
      },
      {
        id: 'mars-entry-2',
        kind: 'marker',
        title: 'Software Engineer',
        subtitle: 'Placeholder Labs',
        period: '2021 — 2024',
        tags: ['Full-stack'],
        description: ['Placeholder role summary — products shipped, systems owned, growth shown.'],
      },
      {
        id: 'mars-entry-3',
        kind: 'marker',
        title: 'Junior Developer',
        subtitle: 'Placeholder Studio',
        period: '2019 — 2021',
        tags: ['Foundations'],
        description: ['Placeholder role summary — where it all started and what was learned.'],
      },
    ],
  },

  jupiter: {
    intro: 'A constellation of skills — larger nodes run deeper.',
    items: [
      {
        id: 'jupiter-node-typescript',
        kind: 'node',
        title: 'TypeScript',
        subtitle: 'Language',
        tags: ['Expert'],
        description: ['Placeholder skill note — years, context where it shines, notable usage.'],
      },
      {
        id: 'jupiter-node-react',
        kind: 'node',
        title: 'React / React Three Fiber',
        subtitle: 'Frontend',
        tags: ['Expert'],
        description: ['Placeholder skill note — component architecture, rendering, this very site as proof.'],
      },
      {
        id: 'jupiter-node-nodejs',
        kind: 'node',
        title: 'Node.js',
        subtitle: 'Backend',
        tags: ['Advanced'],
        description: ['Placeholder skill note — APIs, tooling, realtime services.'],
      },
      {
        id: 'jupiter-node-python',
        kind: 'node',
        title: 'Python',
        subtitle: 'Language',
        tags: ['Advanced'],
        description: ['Placeholder skill note — scripting, data, automation.'],
      },
      {
        id: 'jupiter-node-sql',
        kind: 'node',
        title: 'SQL & Data Modelling',
        subtitle: 'Data',
        tags: ['Comfortable'],
        description: ['Placeholder skill note — schema design, query tuning.'],
      },
    ],
  },

  saturn: {
    intro: 'Certification medallions held in slow orbit.',
    items: [
      {
        id: 'saturn-medal-1',
        kind: 'medallion',
        title: 'AWS Solutions Architect',
        subtitle: 'Amazon Web Services',
        period: '2025',
        tags: ['Cloud'],
        description: ['Placeholder certification note — what it covers and why it was pursued.'],
      },
      {
        id: 'saturn-medal-2',
        kind: 'medallion',
        title: 'Meta Front-End Developer',
        subtitle: 'Meta / Coursera',
        period: '2023',
        tags: ['Frontend'],
        description: ['Placeholder certification note — curriculum highlights.'],
      },
    ],
  },

  uranus: {
    intro: 'Experiments and playground pieces — things built for curiosity.',
    items: [
      {
        id: 'uranus-exp-1',
        kind: 'cube',
        title: 'Shader Playground',
        subtitle: 'GLSL experiments',
        tags: ['WebGL'],
        description: ['Placeholder experiment — what it explores and where to try it.'],
        link: { label: 'Open', href: '#' },
      },
      {
        id: 'uranus-exp-2',
        kind: 'cube',
        title: 'Physics Toys',
        subtitle: 'Rapier sandbox',
        tags: ['WASM'],
        description: ['Placeholder experiment — small interactive physics sketches.'],
        link: { label: 'Open', href: '#' },
      },
      {
        id: 'uranus-exp-3',
        kind: 'cube',
        title: 'Generative Art',
        subtitle: 'Canvas series',
        tags: ['Creative coding'],
        description: ['Placeholder experiment — algorithmic art studies.'],
      },
    ],
  },

  neptune: {
    intro: 'Writing from the deep — articles and notes.',
    items: [
      {
        id: 'neptune-article-1',
        kind: 'scroll',
        title: 'Shipping a 3D Portfolio',
        subtitle: 'Engineering diary',
        period: '2026',
        tags: ['Three.js'],
        description: ['Placeholder article teaser — the war story behind this very site.'],
        link: { label: 'Read', href: '#' },
      },
      {
        id: 'neptune-article-2',
        kind: 'scroll',
        title: 'Notes on Web Performance',
        subtitle: 'Essay',
        period: '2025',
        tags: ['Performance'],
        description: ['Placeholder article teaser — budgets, measurement, habits.'],
        link: { label: 'Read', href: '#' },
      },
    ],
  },
}
