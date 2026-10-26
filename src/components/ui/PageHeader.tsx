import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { EASE } from "@/lib/motion";

type PageHeaderProps = {
  title: string;
  /** Desktop title size; CONTACT uses a smaller one so the asterisk fits */
  fontSize?: string;
  /** Title size at <= 640px */
  mobileFontSize?: string;
  marginBottom?: string;
};

// Giant display title + asterisk shared by /about, /work and /contact
export default function PageHeader({
  title,
  fontSize = "clamp(88px, 17vw, 260px)",
  mobileFontSize = "clamp(52px, 16vw, 88px)",
  marginBottom = "clamp(56px, 7vw, 100px)",
}: PageHeaderProps) {
  return (
    <Reveal
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom,
        ["--page-title-mobile" as string]: mobileFontSize,
      }}
    >
      <h1
        className="page-title"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--color-text)",
          margin: 0,
        }}
      >
        {title}
      </h1>

      <Image
        src="/spark.png"
        alt=""
        width={260}
        height={260}
        className="page-spark"
        style={{
          height: "clamp(64px, 12vw, 180px)",
          width: "auto",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />

      <style>{`
        @media (max-width: 640px) {
          .page-title { font-size: var(--page-title-mobile) !important; }
          .page-spark { height: clamp(40px, 11vw, 64px) !important; margin-left: 16px !important; }
        }
      `}</style>
    </Reveal>
  );
}
