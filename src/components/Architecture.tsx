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
              Trace a <span className="text-gradient">request</span> through
              the stack.
            </>
          }
          description="A simple example of how i build — watch a request travel from client to data layer, then a CI/CD pipeline deploy end-to-end onto AWS."
        />

        <Reveal>
          <ArchitectureViz />
        </Reveal>
      </div>
    </section>
  );
}
