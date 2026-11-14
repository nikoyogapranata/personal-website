import WorkHeader from "@/components/work/WorkHeader";
import WorkGallery from "@/components/work/WorkGallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

// Static: a ?filter is applied on the client (src/lib/workFilter.ts), so the page stays prerendered
// and prefetchable. Sections sit on the tone backdrop, so main stays transparent.
export default function WorkPage() {
  return (
    <>
      <main>
        <WorkHeader />
        <WorkGallery />
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
