// All copy lives here. Every claim is traceable to a repository README, project
// doc, or something Subrata stated directly. Items that still need the owner's
// confirmation are marked  // CONFIRM  so nothing unverified ships by accident.

export const site = {
  name: 'Subrata Saha',
  roles: ['Computer Science Engineer', 'AI/ML Developer', 'Systems Builder', 'Research Enthusiast'],
  statement: 'I build intelligent systems, and take apart the machinery underneath them.',
  github: 'https://github.com/SubrataSaha8191',
  // Add a public email / LinkedIn here and the contact section picks them up.
  email: 'subratasaha8191@gmail.com',
  linkedin: 'https://www.linkedin.com/in/subrata-saha-568a9835a',
  school: 'RCC Institute of Information Technology',
};

export const sections = [
  { id: 'top', label: 'Identity', n: '00', blurb: 'The photograph, then the point cloud behind it.' },
  { id: 'work', label: 'Work', n: '01', blurb: 'Seven projects. Real repos, real limits.' },
  { id: 'lab', label: 'Lab', n: '02', blurb: 'Six layers of engineering I work across.' },
  { id: 'about', label: 'About', n: '03', blurb: 'Who is behind the commits.' },
  { id: 'arsenal', label: 'Arsenal', n: '04', blurb: 'Tools, organised by the layer they serve.' },
  { id: 'path', label: 'Path', n: '05', blurb: 'The chapters so far.' },
  { id: 'contact', label: 'Contact', n: '06', blurb: 'Say hello.' },
];

export const projects = [
  {
    id: 'voyager',
    n: '01',
    title: 'Voyager',
    kicker: 'Applied ML for tourism intelligence',
    status: 'Hult Prize project · in development',
    summary:
      'An AI tourism platform that predicts destination safety, flags likely scams and redistributes demand away from overcrowded places, built for the Hult Prize.',
    approach: [
      'Three serialized models live in trained_models/: tourism_safety, tourism_demand and scam_detection (pickle artefacts).',
      'A FastAPI AI service sits beside a Node/Express API layer, sharing JWT auth, with MongoDB Atlas as the store.',
      'A conversational layer uses a local Ollama model with retrieval over MongoDB context, and a rule-based fallback when the LLM is offline.',
      'External signals (weather, traffic, routing) feed the models; spatial clustering and data processing prepare the inputs.',
    ],
    stack: ['Python', 'FastAPI', 'scikit-learn', 'XGBoost / Random Forest', 'Ollama', 'RAG', 'Node.js', 'Express', 'MongoDB Atlas', 'React'],
    role: 'Contributor on the ML and data side: models, processing and experimentation.', // CONFIRM exact split with team
    note: 'The repository is a fork of the team project, and the project doc describes it as transitioning toward production. No performance numbers are published here because none are documented.',
    links: [
      { label: 'Repository', href: 'https://github.com/SubrataSaha8191/Voyeger_2026' },
      { label: 'Live', href: 'https://voyeger-2026.vercel.app' },
    ],
    img: '/work/voyager.webp',
    tags: ['ML', 'Geospatial', 'RAG'],
  },
  {
    id: 'omen',
    n: '02',
    title: 'OMEN',
    kicker: 'A terminal agent for Linux',
    status: 'Repository · documented capabilities',
    summary:
      'A Rust agent that turns natural language into execution plans on a Linux workstation: scaffolding projects, inspecting the system, and automating repetitive command-line work.',
    approach: [
      'Plans multi-step tasks (create structure, write files, install dependencies, run servers) and, on a failed build, captures the error and re-plans up to two times before aborting.',
      'Slash-commands expose system telemetry (/diagnose), git and docker inspection, a background task manager, web search and page fetch with citations.',
      'Desktop control through standard Linux tools: window management, clipboard, notifications, media via MPRIS.',
      'Macro learning from command history, persistent multi-session conversations, and voice input transcribed with Whisper.',
    ],
    stack: ['Rust', 'Linux', 'LLM tool calling', 'Whisper', 'systemd', 'Docker'],
    role: 'Author.',
    note: 'Features listed are the ones the README documents. This page does not state benchmarks or user counts.',
    links: [{ label: 'Repository', href: 'https://github.com/SubrataSaha8191/OMEN-Terminal-Agent' }],
    img: '/work/omen.webp',
    tags: ['Agents', 'Rust', 'Linux'],
  },
  {
    id: 'lgpsm',
    n: '03',
    title: 'LGPSM',
    kicker: 'Internship · backend & application work',
    status: 'Internship project · deployed',
    summary:
      'A web platform built during an internship. My part was backend engineering and application development around invitations, verification and messaging.',
    approach: [
      'Node.js + Express APIs on MongoDB Atlas, with authentication and verification workflows.',
      'QR-based invitation generation and validation.',
      'Email and WhatsApp integrations for delivering invitations.',
      'API development and testing, plus experiments with agentic AI workflows.',
    ],
    stack: ['Node.js', 'Express', 'MongoDB Atlas', 'REST APIs', 'Postman', 'Next.js (frontend repo)'],
    role: 'Intern: contributed to backend and application development. The platform was a team effort.',
    note: 'Deployed frontend links to a separate hosted backend. Contribution is scoped to the areas listed above.',
    links: [
      { label: 'Frontend repo', href: 'https://github.com/SubrataSaha8191/LGPSM-frontend' },
      { label: 'Live', href: 'https://lgpsm-frontend-beta.vercel.app/' },
    ],
    img: '/work/lgpsm.webp',
    tags: ['Backend', 'Auth', 'Integrations'],
  },
  {
    id: 'facelock',
    n: '04',
    title: 'FaceLock',
    kicker: 'Face unlock for Linux, plus an SDK',
    status: 'Repository · Linux stable, Windows early',
    summary:
      'Face authentication for the Linux desktop: lock screen, sudo and protected apps, enrolled by slowly turning your head so it works off-axis and in dim light. A small Python SDK lets other apps ask "is this the owner?".',
    approach: [
      'Detection with YuNet and recognition with SFace embeddings, with low-light enhancement and quality checks.',
      'Guided nine-direction enrolment; an unlock attempt watches the camera for a few seconds and succeeds as soon as it is confident.',
      'PAM integration for sudo, GDM and LightDM, and a launcher gate that fails closed to a passphrase.',
      'Face data stays on-device and is encrypted at rest. Includes a dashboard and a test suite.',
    ],
    stack: ['Python', 'OpenCV (YuNet, SFace)', 'PAM', 'systemd', 'Linux'],
    role: 'Author.',
    note: 'Documented limits: the app gate guards launching an app, not a window already open; Windows sign-in is not implemented and was tested under Wine only.',
    links: [{ label: 'Repository', href: 'https://github.com/SubrataSaha8191/FaceLock' }],
    img: null,
    tags: ['Systems', 'CV', 'Security'],
  },
  {
    id: 'agni',
    n: '05',
    title: 'Agni Drishti',
    kicker: 'Thermal-source intelligence dashboard',
    status: 'Smart India Hackathon · frontend deployed',
    summary:
      'A geospatial dashboard for separating persistent industrial heat sources (flares, refineries) from transient fires, built for the Smart India Hackathon.',
    approach: [
      'The frontend renders outputs of backend pipelines: FIRMS monitoring, VNF processing, thermal fingerprinting and classification.',
      'Map, filters, lists and detail views behave as one synchronised workspace; uncertainty and missing evidence are shown explicitly rather than hidden.',
      'The data-science approach combines satellite observations (NASA FIRMS / VIIRS) with spatio-temporal persistence filtering.',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Leaflet', 'Recharts', 'FastAPI (backend)', 'NASA FIRMS / VIIRS'],
    role: 'Hackathon team member; this repository is the frontend.', // CONFIRM exact role
    note: 'The backend lives in a separate repository and is not part of this one.',
    links: [
      { label: 'Frontend repo', href: 'https://github.com/SubrataSaha8191/AgniDristi_Frontend' },
      { label: 'Live', href: 'https://agni-dristi-frontend.vercel.app/' },
    ],
    img: '/work/agni.webp',
    tags: ['Geospatial', 'Thermal', 'Dashboard'],
  },
  {
    id: 'chainflow',
    n: '06',
    title: 'ChainFlow',
    kicker: 'Meeting-to-workflow automation',
    status: 'Hackathon-style project · deployed',
    summary:
      'A workflow tool that turns meeting audio into transcripts, minutes and downstream actions, with retrieval over what was said.',
    approach: [
      'The FastAPI server has route modules for transcription (faster-whisper), minutes-of-meeting generation, RAG over transcripts, and email, Slack and Drive integrations.',
      'Firebase handles auth and storage; the client is React + TypeScript on Vite.',
    ],
    stack: ['FastAPI', 'faster-whisper', 'RAG', 'Firebase', 'React', 'TypeScript', 'Vite'],
    role: 'Contributor. The repository is a fork of a team project.', // CONFIRM exact role
    note: 'The repository has no README, so this summary is drawn from its code structure and dependencies only.',
    links: [
      { label: 'Repository', href: 'https://github.com/SubrataSaha8191/ShowcaseX_ChainFlow' },
      { label: 'Live', href: 'https://showcase-x-chain-flow.vercel.app/' },
    ],
    img: '/work/chainflow.webp',
    tags: ['Agents', 'Speech', 'Workflow'],
  },
  {
    id: 'webguard',
    n: '07',
    title: 'WEBGuard',
    kicker: 'Phishing detection with ML and vision',
    status: 'Deployed · extension + API + dashboard',
    summary:
      'A phishing detector that combines URL feature analysis with visual inspection of the page, shipped as an API, a dashboard and a Chrome extension.',
    approach: [
      'URL-based features go through a classical ML model; page screenshots are inspected by a deep-learning vision model.',
      'Verdicts are tri-level: SAFE, SUSPICIOUS or MALICIOUS.',
      'FastAPI backend (PyTorch, scikit-learn, OpenCV), React dashboard, Dockerised.',
    ],
    stack: ['Python', 'PyTorch', 'scikit-learn', 'OpenCV', 'FastAPI', 'React', 'Chrome Extension', 'Docker'],
    role: 'Author.',
    metric: { value: '≈0.88', label: 'accuracy (0.8798) in an earlier evaluation' },
    note: 'The 0.8798 figure comes from one earlier evaluation. It is indicative, not a production guarantee, and I do not claim it generalises to all phishing.',
    links: [
      { label: 'Repository', href: 'https://github.com/SubrataSaha8191/WEBGuard' },
      { label: 'Live', href: 'https://webguard-phis.vercel.app/' },
    ],
    img: '/work/webguard.webp',
    tags: ['ML', 'Security', 'CV'],
  },
];

export const domains = [
  {
    id: 'ml',
    title: 'Machine & Deep Learning',
    text: 'Training, evaluating and serialising models for real prediction problems, from tabular safety scoring to vision networks.',
    tools: ['PyTorch', 'scikit-learn', 'XGBoost', 'Model evaluation'],
    projects: ['voyager', 'webguard'],
  },
  {
    id: 'nlpcv',
    title: 'NLP & Computer Vision',
    text: 'Speech to text, text to structure, pixels to decisions: face recognition, screenshot inspection, transcription.',
    tools: ['Hugging Face', 'OpenCV', 'Whisper'],
    projects: ['facelock', 'webguard', 'chainflow'],
  },
  {
    id: 'agents',
    title: 'Agents & RAG',
    text: 'LLMs that plan, call tools and retrieve context, with explicit fallbacks for when the model is wrong or offline.',
    tools: ['Ollama', 'RAG', 'Tool calling', 'LLM integrations'],
    projects: ['omen', 'voyager', 'chainflow'],
  },
  {
    id: 'systems',
    title: 'Backend & Systems',
    text: 'APIs, auth, data stores and the Linux layer beneath them: services, PAM, systemd, terminals.',
    tools: ['FastAPI', 'Node / Express', 'MongoDB', 'Docker', 'Rust', 'C / C++'],
    projects: ['lgpsm', 'facelock', 'omen'],
  },
  {
    id: 'security',
    title: 'Security Experimentation',
    text: 'Defensive tooling first: phishing detection, local-only biometrics, fail-closed gates, and learning how things break.',
    tools: ['Threat classification', 'PAM', 'Encryption at rest'],
    projects: ['webguard', 'facelock'],
  },
  {
    id: 'oss',
    title: 'Open Source',
    text: 'Publishing the work, SDKs included, and reading other people\'s code to understand how systems actually behave.',
    tools: ['Git & GitHub', 'SDK design', 'Documentation'],
    projects: ['facelock', 'omen'],
  },
];

export const arsenal = [
  { id: 'lang', title: 'Languages', note: 'Low-level to high-level', tools: ['Python', 'TypeScript', 'JavaScript', 'Rust', 'C', 'C++', 'Java'] },
  { id: 'ui', title: 'Interface', note: 'What people touch', tools: ['React', 'Next.js', 'React Native', 'Tailwind CSS', 'HTML / CSS', 'GSAP', 'Three.js'] },
  { id: 'svc', title: 'Services & Data', note: 'What answers the request', tools: ['Node.js', 'Express', 'FastAPI', 'MongoDB', 'REST APIs', 'Docker'] },
  { id: 'ai', title: 'Intelligence', note: 'What learns and decides', tools: ['PyTorch', 'scikit-learn', 'Hugging Face', 'Ollama', 'RAG', 'LLM integrations', 'Training & evaluation'] },
  { id: 'env', title: 'Environment', note: 'Where it gets built', tools: ['Linux / Ubuntu', 'Git & GitHub', 'VS Code', 'Antigravity IDE', 'Postman'] },
];

// Dates are intentionally omitted unless they are known. Add `when: '2026'` to show one.
export const path = [
  { n: '01', title: 'B.Tech, Computer Science & Engineering', where: 'RCC Institute of Information Technology', text: 'Currently in the third year, studying the fundamentals and spending the rest of the time building on top of them.', tag: 'Education', tone: 'ink', vis: 'edu', chips: ['Year 3', 'CSE', 'RCCIIT'] },
  { n: '02', title: 'Hult Prize: Voyager', where: 'AI tourism platform', text: 'Safety, demand and scam-detection models, wired into a FastAPI + Express + MongoDB stack.', tag: 'Competition', tone: 'lime', vis: 'hult', chips: ['Safety', 'Demand', 'Scam detection', 'RAG'] },
  { n: '03', title: 'Smart India Hackathon: Agni Drishti', where: 'Thermal-source intelligence', text: 'A geospatial dashboard for telling industrial heat from wildfire.', tag: 'Hackathon', tone: 'orange', vis: 'sih', chips: ['FIRMS / VIIRS', 'React', 'Leaflet', 'FastAPI'] },
  { n: '04', title: 'Internship: LGPSM', where: 'Backend & application development', text: 'Auth, QR invitations, email and WhatsApp delivery, API testing.', tag: 'Internship', tone: 'yellow', vis: 'qr', chips: ['Node.js', 'Express', 'MongoDB Atlas', 'QR', 'WhatsApp'] },
  { n: '05', title: 'Open source: FaceLock, OMEN, WEBGuard', where: 'GitHub', text: 'Systems-level and security-oriented projects published with their limits documented.', tag: 'Open source', tone: 'night', vis: 'git', chips: ['FaceLock', 'OMEN', 'WEBGuard'] },
];
