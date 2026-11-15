import { TOPICS, validate } from '@/lib/contact'

// The /contact form posts here; the message goes out through Resend's REST API.
// Rules and messages live in src/lib/contact.ts, shared with the form.

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    const json = await request.json()
    if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error()
    body = json
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill this field
  if (typeof body.company === 'string' && body.company !== '') {
    return Response.json({ ok: true })
  }

  // Same checks as the browser, never trusted from it. Field errors go back for the form to
  // show under each blank.
  const { values, errors } = validate(body)
  if (Object.keys(errors).length) {
    return Response.json({ error: 'Please check the highlighted fields.', errors }, { status: 400 })
  }
  const { name, email, message } = values
  const topic = TOPICS.find(t => t.id === values.topic)!

  const apiKey = process.env.RESEND_API_KEY
  const to     = process.env.CONTACT_EMAIL
  // Resend only allows onboarding@resend.dev until a sending domain is verified
  const from   = process.env.CONTACT_FROM ?? 'Portfolio Contact <onboarding@resend.dev>'

  if (!apiKey || !to) {
    console.error('Contact form: RESEND_API_KEY or CONTACT_EMAIL is not set')
    return Response.json({ error: 'The contact form is not configured yet.' }, { status: 500 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to:       [to],
      // Validated above (no whitespace, line breaks, commas or brackets), so it is safe as a
      // header and "Reply" in the inbox goes straight to the visitor
      reply_to: email,
      subject:  `Portfolio: ${topic.subject}, from ${name}`,
      // Plain text only: nothing the visitor typed is ever rendered as HTML
      text:     `Name: ${name}\nEmail: ${email}\nTopic: ${topic.label}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('Contact form: Resend responded', res.status, await res.text())
    return Response.json({ error: 'Your message could not be sent.' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
