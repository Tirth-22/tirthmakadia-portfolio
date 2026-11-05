/**
 * EXPERIENCE — cinematic alternating timeline (PHASE 01 → 04)
 * ---------------------------------------------------------------
 * Real milestones only. Periods come from verified entries; where no
 * exact date exists a general period is used instead of inventing one.
 * Nothing here names an employer, institute or achievement that has
 * not already been stated in this project.
 */
import type { LucideIcon } from "lucide-react";
import { Briefcase, Cloud, GraduationCap, Server } from "lucide-react";

export type TimelinePhase = {
  id: string;
  /** "01" */
  phase: string;
  /** category shown beside the phase number */
  category: string;
  /** verified period — general wording where no exact date exists */
  period: string;
  title: string;
  /** only set when there is a real organisation to name */
  org?: string;
  summary: string;
  tags: string[];
  icon: LucideIcon;
  /** milestone / card accent */
  accent: string;
  /** optional link — only for projects that already exist */
  href?: string;
  hrefLabel?: string;
};

export const phases: TimelinePhase[] = [
  {
    id: "phase-1",
    phase: "01",
    category: "Foundations",
    period: "2024 — 2025",
    title: "Finding My Direction",
    summary:
      "Initially, I decided to explore Cybersecurity, but I found its was difficult for me to understand. That pushed me to explore Software Development. I started learning JavaScript and Java to understand the difference between the MERN and Java development. As I spent more time with Java, I became interested in its OOP concepts, structured approach, and the way it helps build applications. Along the way, I started understanding the broader world of CS, exploring GitHub, repositories, researching technologies, and hackathons. By the end of this phase, I had started finding my direction: Java-based Software Development.",
    tags: ["GitHub", "Hackathon", "Development", "Technology"],
    icon: GraduationCap,
    accent: "#10B981",
  },
  {
    id: "phase-2",
    phase: "02",
    category: "Backend Engineering",
    period: "2025 — 2026",
    title: "From Full Stack to Backend",
    summary:
      "After discovering my interest in Java, I explored Full Stack Development but gradually realised that backend engineering fascinated me more. I went deeper into Java, Spring Boot, REST APIs, JWT, and eventually advanced concepts like microservices, API gateways, Kafka, and system design. That's when the real challenges began. Debugging and understanding distributed services sometimes took days or even a week, as fixing one issue often exposed another. Countless late-night debugging sessions taught me that backend engineering isn't just about writing code and understanding distributed system design isn't easy as it seems — it's about understanding how every component of a system works together and build for failure not just for functionality.",
    tags: ["Java", "Spring Boot", "REST APIs", "JWT", "Microservices", "Kafka", "System Design"],
    icon: Server,
    accent: "#0A84FF",
    href: "https://github.com/Tirth-22/neighborhood-microservices-exchange-platform",
    hrefLabel: "Exchange platform",
  },
  {
    id: "phase-3",
    phase: "03",
    category: "Industry Experience",
    period: "May — June 2026",
    title: "Backend Engineering Intern",
    org: "9Series Inc.",
    summary:
      "This was my first experience working on a project where different team members handled different parts. Connecting everything together was not as simple as I had expected. Working across a multi-language microservices architecture was one of my biggest challenges. Java services handled frontend communication and API integration, while Python services managed the ML model integration. Understanding how independently developed services, built with different languages and frameworks, communicated, exchanged data. Even had to use different DBs like PostgreSQL and MongoDB for structured and unstructured data comes from users and backend services. I also experienced the real importance of Git — working with multiple branches, staging changes, version control, merging, pull requests, code reviews, and development and production workflows.",
    tags: ["Team Collaboration","Git & GitHub", "Microservices"],
    icon: Briefcase,
    accent: "#10B981",
  },
  {
    id: "phase-4",
    phase: "04",
    category: "Cloud & DevOps",
    period: "2026 — Present",
    title: "From Localhost to the Cloud",
    summary:
      "After working on backend systems my focus started moving towards cloud computing and DevOps. I started exploring Docker to containerize applications and Kubernetes to manage containers. Kubernetes was initially difficult to understand, but it introduced me to a completely new way of managing distributed applications. Then came CI/CD, where I learned how automated pipelines build, test, and deliver applications instead of relying on manual deployment. I began exploring how these pipelines work with Docker, Kubernetes, and cloud infrastructure. As I moved deeper, I started learning AWS services such as EC2, S3, RDS, and CloudWatch, understanding how applications can be deployed, hosted, and monitored in the cloud.",
    tags: ["AWS", "Docker", "CI/CD", "Kubernetes", "GitHub Actions"],
    icon: Cloud,
    accent: "#0A84FF",
    href: "https://github.com/Tirth-22/cloud-wise",
    hrefLabel: "CloudWise",
  },
];
