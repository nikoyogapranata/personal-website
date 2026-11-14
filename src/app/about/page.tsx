import StoryHero from "@/components/about/StoryHero";
import AboutBio from "@/components/about/AboutBio";
import ExperienceStack from "@/components/about/ExperienceStack";
import Toolbox from "@/components/about/Toolbox";
import TwoCities from "@/components/about/TwoCities";
import { SHOW_CITIES } from "@/lib/features";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

// Sections sit on the tone backdrop (components/ui/Tone.tsx), so main stays transparent
export default function AboutPage() {
  return (
    <>
      <main>
        <StoryHero />

        <AboutBio />

        <ExperienceStack />
        <Toolbox />
        {/* Off for now: flip SHOW_CITIES in src/lib/features.ts */}
        {SHOW_CITIES && <TwoCities />}
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
