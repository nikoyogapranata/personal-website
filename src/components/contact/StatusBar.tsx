import CityClock from '@/components/ui/CityClock'
import { CITY } from '@/lib/site'

/** The thin row under the navbar: availability on the left, local time and reply time on the right */
export default function StatusBar() {
  return (
    <div className="ct-status">
      <p className="ct-status-item">
        <span className="ct-dot" aria-hidden="true" />
        Open to internships and freelance
      </p>
      <p className="ct-status-item ct-status-time">
        <span>
          It&apos;s <span className="ct-clock"><CityClock timeZone={CITY.timeZone} /></span> in {CITY.name}
        </span>
        <span aria-hidden="true" className="ct-sep">·</span>
        <span>I usually reply within a day</span>
      </p>
    </div>
  )
}
