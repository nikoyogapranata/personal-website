'use client'

import { useSyncExternalStore } from 'react'

/**
 * Local time in a city, updated on the minute. The server and hydration render "--:--" (no
 * mismatch); the real time appears right after. Fixed width, so the swap shifts nothing.
 */

const MINUTE = 60_000

// One shared minute ticker for every clock on the page
function subscribe(onChange: () => void) {
  let timer = 0
  const schedule = () => {
    timer = window.setTimeout(() => { onChange(); schedule() }, MINUTE - (Date.now() % MINUTE) + 50)
  }
  schedule()
  return () => clearTimeout(timer)
}
const currentMinute = () => Math.floor(Date.now() / MINUTE)
const serverMinute = () => null

const formatters = new Map<string, Intl.DateTimeFormat>()
function format(minute: number, timeZone: string) {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })
    formatters.set(timeZone, f)
  }
  return f.format(new Date(minute * MINUTE))
}

export default function CityClock({ timeZone }: { timeZone: string }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute)
  return (
    <span className="city-clock" data-tz={timeZone}>
      {minute === null ? '--:--' : format(minute, timeZone)}
    </span>
  )
}
