export const profile = {
  name: "Tirth Makadia",
  monogram: "TM",
  role: "Java Backend & Cloud DevOps Engineer",
  badge: "Java Backend • Microservices • Cloud & DevOps Engineer",
  headline: [
    { text: "Architecting ", accent: false },
    { text: "Resilient Distributed", accent: true },
    { text: " Systems &", accent: false },
    { text: " Cloud-Native", accent: true },
    { text: " Platforms.", accent: false },
  ],
  subtitle:
    "I design high-throughput Java microservices, resilient event-driven architectures and scalable AWS infrastructure — systems that stay observable, elastic and boringly reliable under load.",
  location: "Rajkot, India",
  timezone: "IST (UTC+5:30)",
  email: "tirthmakadia2006@gmail.com",
  availability: "Available for Opportunities",
  status: "Systems Ready",
  photo: "/profile.jpg",
  resume: "/resume.pdf",
  githubAvatar:
    "https://avatars.githubusercontent.com/u/183889692?v=4&size=460",
} as const;

export const socials = [
  {
    id: "github",
    label: "GitHub",
    handle: "@Tirth-22",
    href: "https://github.com/Tirth-22",
    description: "Source & systems",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "tirth-makadia",
    href: "https://www.linkedin.com/in/tirth-makadia-769b0931b/",
    description: "Professional network",
  },
  {
    id: "leetcode",
    label: "LeetCode",
    handle: "Tirth_22",
    href: "https://leetcode.com/u/Tirth_22",
    description: "Algorithm practice",
  },
] as const;

export const navLinks = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "architecture", label: "How I Build" },
  { id: "projects", label: "Projects" },
  { id: "metrics", label: "Live Metrics" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export const heroTags = [
  { label: "Spring Boot 3", delay: 0 },
  { label: "AWS ECS", delay: 0.4 },
  { label: "Docker", delay: 0.8 },
  { label: "Kafka", delay: 1.6 },
  { label: "PostgreSQL", delay: 1.2 },
] as const;

export const marqueeItems = [
  "Java 21",
  "Spring Boot",
  "Spring Cloud",
  "Microservices",
  "System Design",
  "AWS",
  "Docker",
  "Kubernetes",
  "Terraform",
  "PostgreSQL",
  "Redis",
  "Apache Kafka",
  "GitHub Actions",
  "Nginx",
  "Linux",
] as const;

export const aboutFacts = [
  { k: "Focus", v: "Backend & Distributed Systems" },
  { k: "Runtime", v: "Java 21 · Spring Boot · JVM" },
  { k: "Cloud", v: "AWS · Docker · CI/CD" },
  { k: "Base", v: "Rajkot, India · UTC+5:30" },
  { k: "Status", v: "Open to internships & opportunities" },
  { k: "Response", v: "Within 24 hours" },
] as const;
