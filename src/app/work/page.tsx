import PageHeader from "@/components/ui/PageHeader";
import WorkGrid from "@/components/sections/WorkGrid";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function WorkPage() {
  return (
    <>
      <main
        style={{
          background: "var(--color-bg)",
          minHeight: "100vh",
          padding:
            "clamp(110px, 14vw, 180px) clamp(32px, 6vw, 80px) clamp(80px, 10vw, 140px)",
        }}
      >
        <PageHeader title="WORK" marginBottom="clamp(40px, 5vw, 72px)" />
        <WorkGrid />
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
