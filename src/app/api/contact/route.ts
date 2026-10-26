const MAX = { name: 100, email: 200, subject: 200, message: 5000 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = keyof typeof MAX

function read(body: Record<string, unknown>, key: Field) {
  const value = body[key]
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const to     = process.env.CONTACT_EMAIL
  // Resend only allows onboarding@resend.dev until a sending domain is verified
  const from   = process.env.CONTACT_FROM ?? 'Portfolio Contact <onboarding@resend.dev>'

  if (!apiKey || !to) {
    console.error('Contact form: RESEND_API_KEY or CONTACT_EMAIL is not set')
    return Response.json({ error: 'The contact form is not configured yet.' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill this field
  if (typeof body.company === 'string' && body.company !== '') {
    return Response.json({ ok: true })
  }

  const name    = read(body, 'name')
  const email   = read(body, 'email')
  const subject = read(body, 'subject')
  const message = read(body, 'message')

  if (!name || !email || !message) {
    return Response.json({ error: 'Please fill in your name, email and message.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  for (const key of Object.keys(MAX) as Field[]) {
    if (read(body, key).length > MAX[key]) {
      return Response.json({ error: `Your ${key} is too long.` }, { status: 400 })
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to:       [to],
      reply_to: email,
      subject:  `Portfolio: ${subject || `Message from ${name}`}`,
      text:     `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '-'}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('Contact form: Resend responded', res.status, await res.text())
    return Response.json({ error: 'Your message could not be sent.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
