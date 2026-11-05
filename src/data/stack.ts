import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Braces,
  Cloud,
  Container,
  Cpu,
  Gauge,
  KeyRound,
  Layers,
  Network,
  Plug,
  Repeat,
  Router,
  Server,
  ShieldCheck,
  Signal,
  Timer,
  Unplug,
  Waypoints,
  Workflow,
  Zap,
} from "lucide-react";

export type StackItem = { name: string; note?: string };

export type StackGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  caption: string;
  items: StackItem[];
};

export const stackGroups: StackGroup[] = [
  {
    id: "backend",
    title: "Backend Engineer",
    icon: Braces,
    caption: "Core service layer",
    items: [
      { name: "Java 21", note: "records · virtual threads" },
      { name: "Spring Boot", note: "actuator · profiles" },
      { name: "Spring Security", note: "gateway · discovery" },
      { name: "Microservices", note: "bounded contexts" },
      { name: "REST APIs", note: "versioned · idempotent" },
      { name: "JWT Authentication", note: "stateless auth" },
      { name: "Maven", note: "parallel pipelines" },
      { name: "PostgreSQL", note: "indexing · EXPLAIN" },
      { name: "MySQL", note: "relational modeling" },
      { name: "MongoDB", note: "work queues" },
      { name: "Redis", note: "cache · locks" },
      { name: "Apache Kafka", note: "event streaming" },
    ],
  },
  {
    id: "cloud",
    title: "Cloud & DevOps Engineer",
    icon: Cloud,
    caption: "Infrastructure & delivery",
    items: [
      { name: "AWS EC2 / ECS", note: "compute" },
      { name: "AWS S3 / RDS", note: "storage · sql" },
      { name: "CloudWatch", note: "logs · alarms" },
      { name: "Docker", note: "multi-stage builds" },
      { name: "Kubernetes", note: "self-managed" },
      { name: "CI/CD", note: "Actions · Jenkins" },
      { name: "Terraform", note: "infra as code" },
      { name: "Linux · Nginx", note: "reverse proxy" },
    ],
  },
  {
    id: "design",
    title: "System Design",
    icon: Waypoints,
    caption: "Architecture reasoning",
    items: [
      { name: "Microservices" },
      { name: "API Gateway" },
      { name: "Service Discovery" },
      { name: "Load Balancing" },
      { name: "Circuit Breakers" },
      { name: "Fault Tolerance" },
      { name: "Caching" },
      { name: "Event-Driven Architecture" },
    ],
  },
];

export const systemConcepts: { icon: LucideIcon; label: string; value: string }[] =
  [
    { icon: Zap, label: "Throughput", value: "1.2k req/s" },
    { icon: Timer, label: "p99 latency", value: "148 ms" },
    { icon: ShieldCheck, label: "Auth", value: "JWT · RBAC" },
    { icon: Repeat, label: "Retries", value: "exp. backoff" },
    { icon: Signal, label: "Health", value: "3 probes" },
    { icon: Gauge, label: "Scaling", value: "HPA 2→8" },
    { icon: Layers, label: "Caching", value: "Redis L2" },
    { icon: Router, label: "Routing", value: "path-based" },
    { icon: KeyRound, label: "Secrets", value: "SSM params" },
    { icon: Network, label: "Discovery", value: "Eureka" },
    { icon: Plug, label: "Contracts", value: "OpenAPI 3" },
    { icon: Unplug, label: "Isolation", value: "bulkhead" },
    { icon: Workflow, label: "Pipelines", value: "blue/green" },
    { icon: Container, label: "Runtime", value: "OCI images" },
    { icon: Server, label: "Nodes", value: "multi-AZ" },
    { icon: Boxes, label: "State", value: "12-factor" },
    { icon: Cpu, label: "Concurrency", value: "virtual" },
  ];
