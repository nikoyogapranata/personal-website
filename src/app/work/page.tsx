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
            "var(--page-top) max(var(--page-x), calc((100% - var(--content-max)) / 2)) var(--section-y)",
        }}
      >
        <PageHeader title="WORK" marginBottom="var(--space-xl)" />
        <WorkGrid />
      </main>

      <Contact theme="light" />
      <Footer theme="light" />
    </>
  );
}
