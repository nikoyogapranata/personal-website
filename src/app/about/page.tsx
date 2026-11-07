import StoryHero from "@/components/about/StoryHero";
import ExperienceStack from "@/components/about/ExperienceStack";
import Toolbox from "@/components/about/Toolbox";
import TwoCities from "@/components/about/TwoCities";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { PROFILE } from "@/data";
import { RESUME_PATH } from "@/lib/site";

// Sections sit on the tone backdrop (components/ui/Tone.tsx), so main stays transparent
export default function AboutPage() {
  return (
    <>
      <main>
        <StoryHero />

        {/* The short bio, at reading size */}
        <section className="about-bio" data-tone="light" aria-label="Bio">
          <p>{PROFILE.bio.short}</p>
          <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer" className="hover-accent hover-nudge about-cv">
            <span aria-hidden="true">↗</span> Download CV
          </a>
          <style>{`
            .about-bio {
              padding: var(--section-y) max(var(--page-x), calc((100% - var(--content-max)) / 2));
              display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-m);
            }
            .about-bio p {
              margin: 0; max-width: 38rem;
              font-family: var(--font-sans); font-size: var(--text-body-lg); line-height: 1.75;
              color: var(--color-text-muted);
            }
            .about-cv {
              display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
              font-family: var(--font-display); font-weight: 500; font-size: var(--text-body);
              color: var(--color-text);
              transition: color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
            }
            .about-cv span { font-size: 0.85em; opacity: 0.5; }
          `}</style>
        </section>

        <ExperienceStack />
        <Toolbox />
        <TwoCities />
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
