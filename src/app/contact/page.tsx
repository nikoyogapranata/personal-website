import '@/components/contact/contact.css'
import Reveal from '@/components/ui/Reveal'
import StatusBar from '@/components/contact/StatusBar'
import SentenceForm from '@/components/contact/SentenceForm'
import Channels from '@/components/contact/Channels'
import Footer from '@/components/sections/Footer'
import { DURATION, reveal } from '@/lib/motion'

// Sections sit on the tone backdrop (components/ui/Tone.tsx), so main stays transparent. The top
// block turns to the dark tone once a message is sent.
export default function ContactPage() {
  return (
    <>
      <main className="ct">
        <SentenceForm
          header={
            <>
              <StatusBar />
              <Reveal {...reveal({ onMount: true, duration: DURATION.slow })}>
                <h1 className="ct-title">
                  LET&apos;S TALK<span className="ct-title-stop">.</span>
                </h1>
              </Reveal>
            </>
          }
        />
        <Channels />
      </main>

      <Footer theme="light" />
    </>
  )
}
