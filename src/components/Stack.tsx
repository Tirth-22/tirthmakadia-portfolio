import { motion } from "framer-motion";
import { Boxes, Layers, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import Reveal from "./Reveal";
import { stackGroups } from "../data/stack";
import { EASE } from "../lib/motion";

export default function Stack() {
  return (
    <section id="stack" className="relative scroll-mt-24 pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="shell">
        <SectionHeading
          index="02"
          label="Tech Stack & Foundations"
          title={
            <>
              The systems I <span className="text-gradient">reach for</span>.
            </>
          }
          description="Backend foundations, cloud delivery, and the design vocabulary used to reason about all three."
        />

        {/* ------------------------------------------- matrix cards */}
        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {stackGroups.map((group, i) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                className="min-w-0 h-full"
              >
                <TiltCard className="group h-full" max={6}>
                  <div className="glass flex h-full flex-col rounded-2xl p-5 transition-shadow duration-500 hover:shadow-[0_30px_80px_-50px_var(--c-accent)]">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl border border-line bg-surface-2 text-[var(--c-accent)] transition-all duration-500 group-hover:border-[var(--c-accent)] group-hover:shadow-[0_0_24px_-8px_var(--c-accent)]">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase">
                        {group.caption}
                      </span>
                    </div>

                    <h3 className="text-[15.5px] font-semibold tracking-tight">
                      {group.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item, j) => (
                        <motion.span
                          key={item.name}
                          className="chip"
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: i * 0.05 + j * 0.035,
                            ease: EASE,
                          }}
                          title={item.note}
                        >
                          {item.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* ------------------------------------------- concepts strip */}
        <Reveal delay={0.05}>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-surface p-4">
            <span className="mr-1 flex items-center gap-2 pr-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              <Sparkles className="size-3.5 text-[var(--c-accent)]" />
              design notes
            </span>
            {[
              "Distributed microservices",
              "API gateway",
              "Service discovery",
              "Event-driven architecture",
              "Kafka messaging",
              "CI/CD automation",
              "Docker containerization",
              "Infrastructure as code",
              "AWS IAM",
              "Fault tolerance",
              "Observability",
              "Idempotency",
            ].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
            <span className="ml-auto hidden items-center gap-2 font-mono text-[10px] text-faint md:flex">
              <Layers className="size-3.5" />
              <Boxes className="size-3.5" />
              12-factor
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
