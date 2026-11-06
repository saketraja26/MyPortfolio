// All site content lives here. Edit this file to update the portfolio.
// To swap a portal's procedural reel for a real screen recording, drop an
// .mp4 into /public/videos and set `video: '/videos/<file>.mp4'` on the project.

export const profile = {
  first: 'Saket',
  last: 'Raja',
  role: 'Full-Stack Developer & Designer',
  headline:
    'Full-stack developer and MCA graduate building production-ready web apps, real-time backends and ML-powered data tools — Next.js, Python & AI.',
  quote: "I don't just write code; I visualize the product.",
  location: 'Pune, India',
  coords: '18.52°N · 73.85°E',
  status: 'Open to work',
  statusDetail: 'Software Development & Frontend Engineering — internships & full-time · On-site / Hybrid / Remote',
  email: 'saketraja.work@gmail.com',
  photo: '/images/saket.jpg',
  resumes: [
    { label: 'Full-Stack résumé', file: '/resume/Saket_Raja_Resume_Full_Stack.pdf' },
    { label: 'Data Science résumé', file: '/resume/Saket_Raja_Resume_Data_Science.pdf' },
  ],
  languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/saketraja' },
    { label: 'GitHub', url: 'https://github.com/saketraja26' },
    { label: 'DrawFive', url: 'https://draw-v.vercel.app/' },
    { label: 'CypherCorp', url: 'https://www.cyphercorp.in' },
  ],
  bio: [
    'MCA graduate from MIT-WPU (2024 – 2026), working at the intersection of full-stack engineering, data science and creative design.',
    'I specialise in the Next.js ecosystem — turning high-fidelity Figma designs into pixel-perfect React — and I’m expanding into data science with Python to build data-driven applications.',
    'Before the code, I led design teams for the Y20 Conclave and The Venture Business Council, which is where my eye for UX and visual identity comes from.',
  ],
  stats: [
    { value: 4, suffix: '', label: 'Products shipped' },
    { value: 50, suffix: '+', label: 'Logos & creatives designed' },
    { value: 8.34, suffix: '', label: 'MCA CGPA', decimals: 2 },
    { value: 2, suffix: 'nd', label: 'E.D.G.E. 2025' },
  ],
};

export const projects = [
  {
    slug: 'cyphercorp',
    title: 'CypherCorp',
    kicker: 'AI Data Intelligence & AutoML Platform',
    year: '2026',
    timeline: 'v1.0 · Sep 2026',
    team: 'Saket Raja',
    color: '#5CF2C8',
    video: '',
    summary:
      'Upload a CSV and get a complete analysis: automated EDA, an AI data scientist that explains verified statistics, natural-language SQL, and an AutoML studio that trains, benchmarks and serves the best model.',
    principle: 'Let code handle the numbers. Let AI handle the interpretation.',
    metrics: [
      { value: 4, label: 'Engines in one workspace — EDA, Data Scientist, SQL Analyst, AutoML' },
      { value: 1, suffix: ' CSV', label: 'Is all it takes to go from raw data to deployed predictions' },
      { value: 2800, prefix: '~', label: 'Impressions on the launch post' },
    ],
    features: [
      { title: 'Automated EDA', body: 'Data health scoring and statistical profiling the moment a dataset lands — IQR outlier detection, skewness, and Pearson / Spearman correlations.' },
      { title: 'AI Data Scientist', body: 'Google Gemini reads only verified, code-computed statistics and turns them into plain-language insights — no hallucinated numbers.' },
      { title: 'AI SQL Analyst', body: 'Ask a question in English; it generates SQL, validates it as a safe read-only query, runs it and returns the result.' },
      { title: 'AutoML Studio', body: 'Automated preprocessing (imputation, encoding, scaling, multicollinearity checks), then Random Forest, Gradient Boosting and Ridge / Lasso benchmarked on ROC-AUC, F1, RMSE and R² — the best model is picked automatically.' },
      { title: 'Inference sandbox', body: 'A FastAPI prediction service for serialized joblib models, so users can run interactive what-if predictions from the browser.' },
      { title: 'Tested & deployed', body: 'pytest suites for the API, EDA, ML and SQL engines; CI/CD deploys to Render and Vercel.' },
    ],
    roadmap: ['Dataset cleaning & export', 'Forecasting'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'FastAPI', 'Python', 'PostgreSQL', 'Pandas', 'NumPy', 'SciPy', 'scikit-learn', 'Google Gemini', 'pytest', 'Render', 'Vercel'],
    links: [
      { label: 'Visit cyphercorp.in', url: 'https://www.cyphercorp.in' },
      { label: 'View repository', url: 'https://github.com/saketraja26/cyphercorp' },
    ],
  },
  {
    slug: 'video-qa',
    title: 'Video Q&A',
    kicker: 'AI-Powered Video Content Search & Q&A System',
    year: '2026',
    timeline: 'Dec 2025 – Jan 2026',
    team: 'Saket Raja',
    color: '#A08CFF',
    video: '',
    summary:
      'Turns a library of educational videos into a searchable knowledge base. Ask a question in natural language and get an answer that points to the exact timestamp where it is explained.',
    principle: 'Stop scrubbing through hours of video. Ask, and jump to the moment.',
    metrics: [
      { value: 6900, suffix: '+', label: 'Transcript chunks indexed from 18 videos' },
      { value: 85, suffix: '%+', label: 'Contextual answer accuracy' },
      { value: 90, prefix: '~', suffix: '%', label: 'Less time spent finding content' },
      { value: 1, prefix: '<', suffix: 's', label: 'Semantic search latency' },
    ],
    features: [
      { title: 'Transcription pipeline', body: 'Whisper turns lectures into text, which is chunked and batch-processed with fallbacks so long runs never stall.' },
      { title: 'Semantic search', body: 'BGE-M3 1024-dimensional embeddings with cosine-similarity retrieval return relevant passages in under a second.' },
      { title: 'Timestamped answers', body: 'LLaMA 3.2 running locally via Ollama composes answers grounded in the retrieved chunks — each with its timestamp.' },
      { title: 'Built to ship', body: 'Command-line interface, joblib-cached artifacts and a GitHub Actions CI/CD pipeline.' },
    ],
    stack: ['Python 3.10+', 'Whisper', 'BGE-M3', 'LLaMA 3.2', 'Ollama', 'scikit-learn', 'pandas', 'NumPy', 'joblib', 'GitHub Actions'],
    links: [{ label: 'View repository', url: 'https://github.com/saketraja26/Learning-assistant-' }],
  },
  {
    slug: 'drawzzl',
    title: 'Drawzzl',
    kicker: 'Real-time Multiplayer Drawing Game',
    year: '2025',
    timeline: 'Oct – Dec 2025',
    team: 'Saket Raja & Pranav',
    color: '#FF6B9E',
    video: '',
    summary:
      'A real-time draw-and-guess game where rooms of 15+ players sketch, guess and score live. Built around a server-authoritative game engine that survives flaky connections.',
    principle: 'Real-time should feel instant — and never fall over.',
    metrics: [
      { value: 15, suffix: '+', label: 'Concurrent players per room' },
      { value: 100, prefix: '<', suffix: 'ms', label: 'Stroke-to-screen latency' },
      { value: 99.9, suffix: '%', decimals: 1, label: 'Game session stability' },
      { value: 34, suffix: '%', label: 'Smaller main component after refactor' },
    ],
    features: [
      { title: 'Live canvas', body: 'Socket.IO streams strokes between players and Konva.js renders them, with touch-optimised drawing for mobile.' },
      { title: 'Turn-based engine', body: 'A Node.js / Express engine runs rounds, time-decay scoring, and AFK and cleanup services.' },
      { title: 'Resilient sessions', body: 'A 3-minute graceful reconnection window and duplicate-connection prevention keep games intact.' },
      { title: 'Shipped with CI/CD', body: 'Frontend on Vercel, game server on Render, both deployed through CI/CD.' },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Node.js', 'Express', 'Socket.IO', 'Konva.js', 'MongoDB', 'Tailwind CSS', 'Vercel', 'Render'],
    links: [
      { label: 'Play Drawzzl', url: 'https://drawzzl-frontend.vercel.app' },
      { label: 'Frontend repo', url: 'https://github.com/saketraja26/drawzzl-frontend' },
      { label: 'Backend repo', url: 'https://github.com/saketraja26/drawzzl-backend' },
    ],
  },
  {
    slug: 'drawfive',
    title: 'DrawFive',
    kicker: 'Esports Tournament Management Platform',
    year: '2025',
    timeline: 'Aug 2025 – 2026',
    team: 'Saket Raja, Pranav Nigade & Vivek Kumar',
    color: '#FFB547',
    video: '',
    summary:
      'A platform for running esports tournaments end to end: creating events, onboarding players and teams, generating brackets, scheduling matches and running map veto and coin toss. It ran the live offline map veto at the Aarohan esports event.',
    principle: 'Organisers should run the bracket, not the spreadsheet.',
    award: '2nd Place · E.D.G.E. 2025 — Web Application Division, MIT-WPU',
    metrics: [
      { value: 30, prefix: '~', suffix: 'ms', label: 'Duplicate-registration check, down from ~400ms' },
      { value: 3, label: 'Veto formats — BO1, BO3 and BO5' },
      { value: 2, suffix: 'nd', label: 'Place at E.D.G.E. 2025, Web Application Division' },
    ],
    features: [
      { title: 'Tournament builder', body: 'Organisers set rules, formats and dates; players register solo or as teams, with duplicate prevention.' },
      { title: 'Brackets & scheduling', body: 'Single- and double-elimination bracket generation, match scheduling and result resolution, with live updates over Socket.IO.' },
      { title: 'Map veto & coin toss', body: 'Turn-by-turn ban/pick for BO1, BO3 and BO5 matches — used live at the Aarohan offline event.' },
      { title: 'Auth & roles', body: 'Role-based access control (Admin, Player, Guest) built on NextAuth (Email, Google, GitHub) with JWT and role middleware.' },
      { title: 'Fast & validated', body: 'Mobile-first SSR on Next.js 15; Zod validation on every API route and MongoDB indexes that cut lookups ~13×.' },
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Socket.IO', 'Zod', 'MongoDB Atlas', 'Mongoose', 'NextAuth', 'Vercel'],
    links: [
      { label: 'Visit drawfive.in', url: 'https://draw-v.vercel.app/' },
      { label: 'View repository', url: 'https://github.com/pranavnigade123/DrawV' },
    ],
  },
];

export const experience = [
  { role: 'Co-Founder', org: 'Draw V — esports initiative', period: 'Feb 2025 — Present', note: 'Hybrid · Pune' },
  { role: 'Graphic Designer & Event Coordinator', org: 'MIT-WPU Aarohan — The Cultural Fest', period: 'Jan 2023 — Present' },
  { role: 'Freelance Graphic Designer', org: 'Self-employed', period: '2022 — Present', note: '50+ logos & promo creatives' },
  { role: 'Head of Design', org: 'The Venture MIT-WPU — Business Council', period: 'Dec 2023 — Apr 2025' },
  { role: 'Designer & Content Creator (Intern)', org: 'Decrypt0', period: 'Dec 2023 — Apr 2024' },
  { role: 'Event Coordinator', org: 'Y20 India 2023 Conclave', period: 'Sep — Dec 2023', note: 'Event graphic design' },
  { role: 'Social Media Designer', org: 'RIDE, MIT-WPU', period: 'Jul — Oct 2023' },
];

export const highlight = {
  label: 'Leadership',
  title: 'Led the DrawFive × Aarohan esports division',
  body: 'A three-day Valorant, BGMI and FIFA LAN tournament with live-streamed finals and real-time in-game data overlays — run on the platform we built.',
};

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'SQL'] },
  { group: 'Frontend', items: ['Next.js', 'React', 'Redux / Context API', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Konva.js', 'WebSockets'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'FastAPI', 'REST APIs', 'Socket.IO', 'NextAuth', 'JWT', 'RBAC', 'Zod'] },
  { group: 'Data & AI', items: ['Pandas', 'NumPy', 'SciPy', 'scikit-learn', 'PyTorch', 'AutoML', 'NLP', 'Ollama', 'LLaMA', 'BGE-M3', 'Whisper', 'Gemini', 'RAG', 'Power BI', 'Tableau'] },
  { group: 'Databases & DevOps', items: ['MongoDB Atlas', 'PostgreSQL', 'MySQL', 'Git / GitHub', 'Vercel', 'Render', 'GitHub Actions', 'CI/CD'] },
  { group: 'Design', items: ['Figma', 'Adobe Illustrator', 'Creative Suite', 'Branding', 'Event graphics'] },
];

export const education = [
  { degree: 'Master of Computer Applications', school: 'MIT World Peace University', period: 'Jul 2024 — May 2026', note: 'Completed · CGPA 8.34 · Full-stack development, data science & system design' },
  { degree: 'Bachelor of Computer Applications', school: 'MIT World Peace University', period: '2021 — 2024', note: 'CGPA 8.6 · Placement Coordinator · Design Head, Venture Business Council' },
];

export const certifications = [
  { name: 'Google Advanced Data Analytics', issuer: 'Google', date: '' },
  { name: 'Share Data Through the Art of Visualization', issuer: 'Google', date: 'Mar 2026' },
  { name: 'The Ultimate Job-Ready Data Science Course', issuer: 'CodeWithHarry', date: 'Sep 2025' },
  { name: 'Foundations of AI and Machine Learning', issuer: 'Microsoft', date: 'Sep 2025' },
  { name: 'Building a Cybersecurity Toolkit', issuer: 'University of Washington', date: 'Dec 2022' },
  { name: 'Python Basics for Data Science', issuer: 'IBM · edX', date: 'Oct 2020' },
  { name: 'Python for Web & Backend Development', issuer: 'edX', date: '' },
  { name: 'Full Stack Web Development (MERN / Next.js)', issuer: '', date: '' },
];

export const writing = [
  { type: 'Talk', title: 'Big Data in the Video Game Industry', meta: 'with Pranav Nigade · mentor Raja Bavani' },
  { type: 'Post', title: 'Why Next.js has become my default for web development', meta: 'LinkedIn' },
  { type: 'Post', title: 'Learning more vs. building more in data science', meta: 'LinkedIn' },
];
