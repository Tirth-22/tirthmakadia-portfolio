import SmoothScroll from "./components/SmoothScroll";
import AmbientBackground from "./components/AmbientBackground";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Stack from "./components/Stack";
import Architecture from "./components/Architecture";
import Projects from "./components/Projects";
import Metrics from "./components/Metrics";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import ResumeModal from "./components/ResumeModal";
import IntroLoader from "./components/IntroLoader";
import { ResumeProvider, ToastProvider } from "./lib/ui";
import { IntroProvider } from "./lib/intro";
import { marqueeItems } from "./data/site";

export default function App() {
  return (
    <ToastProvider>
      <ResumeProvider>
        <IntroProvider>
          <SmoothScroll />
          <AmbientBackground />

          <Header />

          <main className="relative">
            <Hero />
            <Marquee items={marqueeItems} className="relative" />
            <About />
            <Stack />
            <Architecture />
            <Projects />
            <Metrics />
            <Experience />
            <Contact />
          </main>

          <ResumeModal />

          {/* last child — its effects run after every other listener mounts */}
          <IntroLoader />
        </IntroProvider>
      </ResumeProvider>
    </ToastProvider>
  );
}
