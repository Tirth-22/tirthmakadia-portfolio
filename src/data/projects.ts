export type Project = {
  id: string;
  index: string;
  title: string;
  category: string;
  summary: string;
  architecture: string;
  highlights: string[];
  stack: string[];
  repo: string;
  /** Optional deployed demo — falls back to repo if unset */
  demo?: string;
  /** Renders an in-place interactive demo panel instead of an external demo link */
  liveDemo?: boolean;
  visualCaption: string;
  visual: "exchange" | "cloudwise" | "stream" | "formation";
  accent: "blue" | "amber" | "cyan" | "emerald";
  theme: {
    accentColor: string;
    cardBorder: string;
    borderGlow: string;
    badgeBg: string;
    badgeText: string;
  };
};

function themeFrom(primary: string, border: string) {
  return {
    accentColor: primary,
    cardBorder: border,
    borderGlow: `${primary}33`,
    badgeBg: `${primary}14`,
    badgeText: primary,
  };
}

export const projects: Project[] = [
  {
    id: "exchange",
    index: "01",
    title: "Neighborhood Microservices Exchange Platform",
    category: "Distributed Microservices & Event Architecture",
    summary:
      "Full-stack modular platform for local service exchanges featuring independent services, API Gateway routing, secure JWT authentication and high-concurrency data exchange.",
    architecture:
      "client → api-gateway → auth · user · order → kafka → postgresql",
    highlights: [
      "API Gateway routes traffic to isolated domain services",
      "Stateless JWT auth with role-scoped authorization",
      "Event-driven data exchange with idempotent consumers",
      "Containerized services orchestrated via Docker",
    ],
    stack: ["Java", "Spring Boot", "Microservices", "Docker", "PostgreSQL"],
    repo: "https://github.com/Tirth-22/neighborhood-microservices-exchange-platform",
    demo: "https://github.com/Tirth-22/neighborhood-microservices-exchange-platform",
    visualCaption: "Gateway fan-out to domain services, Kafka, and PostgreSQL",
    visual: "exchange",
    accent: "blue",
    theme: themeFrom("#2496ED", "#1E40AF"),
  },
  {
    id: "cloudwise",
    index: "02",
    title: "CloudWise",
    category: "Cloud Infrastructure Optimization & Deployment Automation",
    summary:
      "Cloud infrastructure platform designed to analyze application deployment requirements, automate deployment to user-owned AWS infrastructure and provide cloud cost optimization recommendations.",
    architecture:
      "github-repo → repo-analysis → resource-estimation → aws-iam-role → deployment → cost-optimization",
    highlights: [
      "GitHub repository integration and deployment configuration analysis",
      "Role-based AWS account access without storing user access keys",
      "Automated application deployment to AWS infrastructure",
      "Cloud resource monitoring and cost optimization recommendations",
    ],
    stack: ["Python", "Django", "AWS", "React", "MongoDB", "Docker", "CI/CD"],
    repo: "https://github.com/Tirth-22/cloud-wise",
    demo: "https://github.com/Tirth-22/cloud-wise",
    visualCaption: "Repository analysis through IAM-validated AWS deployment",
    visual: "cloudwise",
    accent: "amber",
    theme: themeFrom("#F59E0B", "#92400E"),
  },
  {
    id: "stream",
    index: "03",
    title: "StreamAPI Grouping Utility",
    category: "Java Functional Pipelines & Hierarchical Data Processing",
    summary:
      "Reusable Java utility that groups lists of objects by multiple hierarchical criteria in a single pass — functional pipelines instead of nested map bookkeeping.",
    architecture:
      "source list → collect → groupingBy(level 1) → downstream → groupingBy(level 2) → immutable result",
    highlights: [
      "Multi-level collectors with downstream mapping",
      "Single-pass processing — O(n) time, bounded memory",
      "Immutable results and composable grouping stages",
      "Benchmarked against nested map implementations",
    ],
    stack: ["Java 21", "Streams", "Collectors", "JUnit", "JMH"],
    repo: "https://github.com/Tirth-22/StreamAPI-grouping-utility",
    demo: "https://github.com/Tirth-22/StreamAPI-grouping-utility",
    liveDemo: true,
    visualCaption: "Hierarchical Stream API grouping pipeline",
    visual: "stream",
    accent: "cyan",
    theme: themeFrom("#06B6D4", "#155E75"),
  },
  {
    id: "formation",
    index: "04",
    title: "Football Formation Generator",
    category: "Tactical Lineup & Squad Grouping Engine",
    summary:
      "A Java-based utility that evaluates player positions, tactical requirements and grouping constraints to generate suitable football formations and squad arrangements.",
    architecture:
      "player input → position classification → tactical matching → formation validation → squad grouping",
    highlights: [
      "Position-based player grouping across tactical zones",
      "Dynamic formation matching (4-3-3, 4-2-3-1, 3-5-2)",
      "Constraint-based lineup validation and chemistry scoring",
      "Modular player role and squad grouping architecture",
    ],
    stack: ["Java", "Algorithms", "OOP", "Squad Grouping", "Sports Analytics"],
    repo: "https://github.com/Tirth-22/Football-Formation-Generator",
    demo: "https://github.com/Tirth-22/Football-Formation-Generator",
    visualCaption: "Position grouping into a validated tactical lineup",
    visual: "formation",
    accent: "emerald",
    theme: themeFrom("#10B981", "#065F46"),
  },
];
