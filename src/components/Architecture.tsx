import ArchitectureViz from "./ArchitectureViz";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function Architecture() {
  return (
    <section
      id="architecture"
      className="relative scroll-mt-24 py-20 md:py-28"
      aria-label="How I build"
    >
      <div className="shell">
        <SectionHeading
          index="03"
          label="How I Build"
          title={
            <>
              How I build systems and <span className="text-gradient">deploy to AWS</span>.
            </>
          }
          description="A continuous end-to-end look at how application requests flow through microservices, stream through Kafka, and continuously deploy onto AWS cloud infrastructure."
        />

        <div className="mt-8">
          <Reveal>
            <ArchitectureViz />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
