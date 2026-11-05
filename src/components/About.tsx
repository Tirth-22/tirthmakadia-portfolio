import { motion } from "framer-motion";
import { ArrowUpRight, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { aboutFacts } from "../data/site";
import { EASE } from "../lib/motion";

const principles = [
  {
    n: "01",
    t: "Understand before building",
    d: "Good engineering starts with understanding the problem, defining boundaries, and making thoughtful architectural decisions.",
  },
  {
    n: "02",
    t: "Design for reliability",
    d: "Failures are inevitable. Timeouts, retries, circuit breakers, and fault isolation are essential parts of building resilient systems.",
  },
  {
    n: "03",
    t: "Automate what matters",
    d: "From containerization to CI/CD, automation makes deployments repeatable and development workflows more reliable.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-24 pt-20 pb-20 md:pt-28 md:pb-28">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------- left */}
          <div className="lg:col-span-5">
            <SectionHeading
              index="01"
              label="About"
              title={
                <>
                  Engineering systems,
                  <br />
                  not just <span className="text-gradient">applications</span>.
                </>
              }
              description="I'm Tirth Makadia — a Computer Science undergraduate focused on Java Backend Engineering, Cloud Computing, and DevOps. I enjoy understanding how software works beneath the surface, from backend architecture and distributed services to deployment and infrastructure."
            />

            <Reveal delay={0.1}>
              <dl className="overflow-hidden rounded-2xl border border-line bg-surface">
                {aboutFacts.map((f, i) => (
                  <div
                    key={f.k}
                    className={`flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-300 hover:bg-surface-2 ${
                      i < aboutFacts.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <dt className="font-mono text-[10.5px] tracking-[0.16em] text-faint uppercase">
                      {f.k}
                    </dt>
                    <dd className="text-right text-[13px] font-medium tracking-tight">
                      {f.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* ------------------------------------------------- right */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.45] font-medium tracking-tight text-balance">
                I build backend applications with a systems mindset — focusing
                on{" "}
                <span className="text-gradient">
                  clean architecture, reliable communication, scalability,
                </span>{" "}
                and the infrastructure that brings software to life.
              </p>
            </Reveal>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Reveal delay={0.06}>
                <p className="text-[14.5px] leading-relaxed text-muted">
                  My core development work revolves around Java and Spring Boot:
                  designing REST APIs, building microservices, implementing
                  authentication, and working with databases such as PostgreSQL
                  and MongoDB.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="text-[14.5px] leading-relaxed text-muted">
                  Beyond application development, I'm exploring cloud
                  infrastructure and automation — working with AWS, Docker,
                  GitHub Actions, and CI/CD pipelines to understand how
                  applications move from code to deployment.
                </p>
              </Reveal>
            </div>

            {/* principles */}
            <div className="mt-10 grid gap-3">
              {principles.map((p, i) => (
                <motion.div
                  key={p.n}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-surface px-4 py-4 transition-all duration-300 hover:border-[var(--c-line-strong)] hover:bg-surface-2"
                >
                  <span className="mt-0.5 font-mono text-[11px] text-[var(--c-accent)]">
                    {p.n}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[14px] font-medium tracking-tight">
                      {p.t}
                      <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">
                      {p.d}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>

            {/* pull quote */}
            <Reveal delay={0.1}>
              <blockquote className="mt-8 flex gap-4 rounded-2xl border border-line bg-[linear-gradient(120deg,color-mix(in_srgb,var(--c-surface)_100%,transparent),color-mix(in_srgb,var(--c-surface-2)_100%,transparent))] px-5 py-5">
                <Quote className="size-5 shrink-0 text-[var(--c-accent)] opacity-70" />
                <p className="text-[14.5px] leading-relaxed text-muted italic">
                  “Great software isn't just written. It's designed, deployed,
                  observed, and continuously improved.”
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
