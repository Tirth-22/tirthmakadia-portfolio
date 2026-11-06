/**
 * System Topology Data Model — Continuous Fan-Out Microservices Architecture
 */

export type TopoNode = {
  id: string;
  kind: "client" | "gateway" | "service" | "kafka" | "data" | "aws" | "cicd";
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  accent: string;
};

export type ContinuousEdge = {
  id: string;
  d: string;
  color: string;
  dur: string;
  delay: string;
};

export const CANVAS = { w: 1020, h: 320 };

/* ---------------- Main Architecture Nodes ---------------- */
export const ARCH_NODES: TopoNode[] = [
  // 1. Client
  {
    id: "client",
    kind: "client",
    x: 35,
    y: 65,
    w: 110,
    h: 60,
    title: "Client",
    sub: "React · browser",
    accent: "#E2E8F0",
  },
  // 2. Gateway
  {
    id: "gateway",
    kind: "gateway",
    x: 195,
    y: 58,
    w: 120,
    h: 74,
    title: "Gateway",
    sub: "jwt · route",
    accent: "#38BDF8",
  },
  // 3. Stacked Microservices
  {
    id: "auth-svc",
    kind: "service",
    x: 395,
    y: 32,
    w: 130,
    h: 32,
    title: "auth-svc",
    sub: "JWT & Access",
    accent: "#10B981",
  },
  {
    id: "user-svc",
    kind: "service",
    x: 395,
    y: 79,
    w: 130,
    h: 32,
    title: "user-svc",
    sub: "Profile & State",
    accent: "#10B981",
  },
  {
    id: "request-svc",
    kind: "service",
    x: 395,
    y: 126,
    w: 130,
    h: 32,
    title: "request-svc",
    sub: "Domain Logic",
    accent: "#10B981",
  },
  // 4. Separate Small Kafka Layer
  {
    id: "kafka",
    kind: "kafka",
    x: 580,
    y: 68,
    w: 95,
    h: 54,
    title: "Kafka",
    sub: "event stream",
    accent: "#06B6D4",
  },
  // 5. Database (PostgreSQL)
  {
    id: "data",
    kind: "data",
    x: 720,
    y: 62,
    w: 110,
    h: 66,
    title: "PostgreSQL",
    sub: "relational db",
    accent: "#3B82F6",
  },
  // 6. AWS Cloud
  {
    id: "aws",
    kind: "aws",
    x: 875,
    y: 50,
    w: 120,
    h: 90,
    title: "AWS Cloud",
    sub: "EC2 · Docker · Nginx",
    accent: "#F59E0B",
  },
];

/* ---------------- CI/CD Secondary Strip ---------------- */
export const CICD_NODES: TopoNode[] = [
  {
    id: "github",
    kind: "cicd",
    x: 195,
    y: 220,
    w: 120,
    h: 50,
    title: "GitHub",
    sub: "repository",
    accent: "#06B6D4",
  },
  {
    id: "actions",
    kind: "cicd",
    x: 375,
    y: 220,
    w: 145,
    h: 50,
    title: "GitHub Actions",
    sub: "test & build",
    accent: "#06B6D4",
  },
  {
    id: "docker",
    kind: "cicd",
    x: 580,
    y: 220,
    w: 120,
    h: 50,
    title: "Docker",
    sub: "container image",
    accent: "#06B6D4",
  },
  {
    id: "deploy-aws",
    kind: "cicd",
    x: 760,
    y: 220,
    w: 125,
    h: 50,
    title: "AWS Deploy",
    sub: "EC2 rollout",
    accent: "#F59E0B",
  },
];

/* ---------------- Continuous Moving Edges ---------------- */
export const CONTINUOUS_EDGES: ContinuousEdge[] = [
  // Client -> Gateway
  {
    id: "e-client-gw",
    d: "M 145 95 L 195 95",
    color: "#38BDF8",
    dur: "2.0s",
    delay: "0s",
  },
  // Gateway Fan-Out to 3 Services
  {
    id: "e-gw-auth",
    d: "M 315 95 C 355 95, 365 48, 395 48",
    color: "#10B981",
    dur: "2.4s",
    delay: "0.2s",
  },
  {
    id: "e-gw-user",
    d: "M 315 95 L 395 95",
    color: "#10B981",
    dur: "2.2s",
    delay: "0.3s",
  },
  {
    id: "e-gw-req",
    d: "M 315 95 C 355 95, 365 142, 395 142",
    color: "#10B981",
    dur: "2.4s",
    delay: "0.4s",
  },

  // 3 Services -> Kafka (Separate layer)
  {
    id: "e-auth-kafka",
    d: "M 525 48 C 555 48, 560 95, 580 95",
    color: "#06B6D4",
    dur: "2.2s",
    delay: "0.5s",
  },
  {
    id: "e-user-kafka",
    d: "M 525 95 L 580 95",
    color: "#06B6D4",
    dur: "2.0s",
    delay: "0.6s",
  },
  {
    id: "e-req-kafka",
    d: "M 525 142 C 555 142, 560 95, 580 95",
    color: "#06B6D4",
    dur: "2.2s",
    delay: "0.7s",
  },

  // Kafka -> PostgreSQL
  {
    id: "e-kafka-data",
    d: "M 675 95 L 720 95",
    color: "#3B82F6",
    dur: "2.0s",
    delay: "0.8s",
  },

  // PostgreSQL -> AWS Cloud
  {
    id: "e-data-aws",
    d: "M 830 95 L 875 95",
    color: "#F59E0B",
    dur: "2.0s",
    delay: "1.0s",
  },

  // CI/CD Strip Continuous Lines
  {
    id: "e-gh-act",
    d: "M 315 245 L 375 245",
    color: "#06B6D4",
    dur: "2.6s",
    delay: "0.2s",
  },
  {
    id: "e-act-dock",
    d: "M 520 245 L 580 245",
    color: "#06B6D4",
    dur: "2.6s",
    delay: "0.6s",
  },
  {
    id: "e-dock-deploy",
    d: "M 700 245 L 760 245",
    color: "#06B6D4",
    dur: "2.6s",
    delay: "1.0s",
  },
  // Upward Connector from AWS Deploy into AWS Cloud
  {
    id: "e-deploy-up-aws",
    d: "M 885 220 L 885 140",
    color: "#F59E0B",
    dur: "2.2s",
    delay: "1.4s",
  },
];
