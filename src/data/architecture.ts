/**
 * System Topology Data Model — Fan-Out Microservices Architecture
 */

export type FlowKind = "request" | "deploy";

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

export type TopoEdge = {
  id: string;
  flow: "request" | "deploy";
  d: string;
  color: string;
};

export const CANVAS = { w: 1080, h: 300 };

/* ---------------- Main Architecture Nodes ---------------- */
export const ARCH_NODES: TopoNode[] = [
  // Client
  {
    id: "client",
    kind: "client",
    x: 40,
    y: 65,
    w: 125,
    h: 62,
    title: "Client",
    sub: "React · browser",
    accent: "#E2E8F0",
  },
  // Gateway
  {
    id: "gateway",
    kind: "gateway",
    x: 215,
    y: 58,
    w: 135,
    h: 76,
    title: "Gateway",
    sub: "jwt · route",
    accent: "#38BDF8",
  },
  // Stacked Microservices (Image 2 style)
  {
    id: "auth-svc",
    kind: "service",
    x: 430,
    y: 35,
    w: 145,
    h: 34,
    title: "auth-svc",
    sub: "JWT & Access",
    accent: "#10B981",
  },
  {
    id: "user-svc",
    kind: "service",
    x: 430,
    y: 79,
    w: 145,
    h: 34,
    title: "user-svc",
    sub: "Profile & State",
    accent: "#10B981",
  },
  {
    id: "request-svc",
    kind: "service",
    x: 430,
    y: 123,
    w: 145,
    h: 34,
    title: "request-svc",
    sub: "Domain Logic",
    accent: "#10B981",
  },
  // Kafka broker — its own small layer between the services and storage
  {
    id: "kafka",
    kind: "kafka",
    x: 610,
    y: 74,
    w: 100,
    h: 44,
    title: "Kafka",
    sub: "event stream",
    accent: "#10B981",
  },
  // Data Layer (PostgreSQL)
  {
    id: "data",
    kind: "data",
    x: 750,
    y: 61,
    w: 135,
    h: 70,
    title: "Data Layer",
    sub: "postgresql",
    accent: "#38BDF8",
  },
  // AWS Cloud
  {
    id: "aws",
    kind: "aws",
    x: 925,
    y: 54,
    w: 140,
    h: 84,
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
    x: 185,
    y: 215,
    w: 125,
    h: 50,
    title: "GitHub",
    sub: "repository",
    accent: "#06B6D4",
  },
  {
    id: "actions",
    kind: "cicd",
    x: 375,
    y: 215,
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
    y: 215,
    w: 125,
    h: 50,
    title: "Docker",
    sub: "container image",
    accent: "#06B6D4",
  },
  {
    id: "deploy-aws",
    kind: "cicd",
    x: 765,
    y: 215,
    w: 130,
    h: 50,
    title: "AWS Deploy",
    sub: "EC2 rollout",
    accent: "#F59E0B",
  },
];

/* ---------------- Connecting Edges ---------------- */
export const EDGES: TopoEdge[] = [
  // Client -> Gateway
  {
    id: "e-client-gw",
    flow: "request",
    d: "M 165 96 L 215 96",
    color: "#38BDF8",
  },
  // Gateway Fan-Out to the 3 Microservices
  {
    id: "e-gw-auth",
    flow: "request",
    d: "M 350 96 C 390 96, 395 52, 430 52",
    color: "#10B981",
  },
  {
    id: "e-gw-user",
    flow: "request",
    d: "M 350 96 L 430 96",
    color: "#10B981",
  },
  {
    id: "e-gw-req",
    flow: "request",
    d: "M 350 96 C 390 96, 395 140, 430 140",
    color: "#10B981",
  },

  // 3 Microservices converging into the Kafka layer
  {
    id: "e-auth-data",
    flow: "request",
    d: "M 575 52 C 595 52, 595 96, 610 96",
    color: "#38BDF8",
  },
  {
    id: "e-user-data",
    flow: "request",
    d: "M 575 96 L 610 96",
    color: "#38BDF8",
  },
  {
    id: "e-req-data",
    flow: "request",
    d: "M 575 140 C 595 140, 595 96, 610 96",
    color: "#38BDF8",
  },

  // Kafka -> Data Layer
  {
    id: "e-kafka-data",
    flow: "request",
    d: "M 710 96 L 750 96",
    color: "#10B981",
  },

  // Data Layer -> AWS Cloud
  {
    id: "e-data-aws",
    flow: "request",
    d: "M 885 96 L 925 96",
    color: "#F59E0B",
  },

  // CI/CD Strip Edges
  {
    id: "e-gh-act",
    flow: "deploy",
    d: "M 310 240 L 375 240",
    color: "#06B6D4",
  },
  {
    id: "e-act-dock",
    flow: "deploy",
    d: "M 520 240 L 580 240",
    color: "#06B6D4",
  },
  {
    id: "e-dock-deploy",
    flow: "deploy",
    d: "M 705 240 L 765 240",
    color: "#06B6D4",
  },
  // Upward Connector: AWS Deploy step up to AWS Cloud node
  {
    id: "e-deploy-up-aws",
    flow: "deploy",
    d: "M 855 215 L 990 140",
    color: "#F59E0B",
  },
];

/* ---------------- Simulation Sequences ---------------- */
export const TRACE_STEPS: Record<
  FlowKind,
  {
    nodeIds: string[];
    edgeIds?: string[];
  }[]
> = {
  request: [
    { nodeIds: ["client"] },
    { nodeIds: ["gateway"], edgeIds: ["e-client-gw"] },
    {
      nodeIds: ["auth-svc", "user-svc", "request-svc"],
      edgeIds: ["e-gw-auth", "e-gw-user", "e-gw-req"],
    },
    {
      nodeIds: ["kafka"],
      edgeIds: ["e-auth-data", "e-user-data", "e-req-data"],
    },
    {
      nodeIds: ["data"],
      edgeIds: ["e-kafka-data"],
    },
    { nodeIds: ["aws"], edgeIds: ["e-data-aws"] },
  ],
  deploy: [
    { nodeIds: ["github"] },
    { nodeIds: ["actions"], edgeIds: ["e-gh-act"] },
    { nodeIds: ["docker"], edgeIds: ["e-act-dock"] },
    { nodeIds: ["deploy-aws"], edgeIds: ["e-dock-deploy"] },
    { nodeIds: ["aws"], edgeIds: ["e-deploy-up-aws"] },
  ],
};
