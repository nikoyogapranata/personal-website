// The /contact form's fields and rules, shared by the browser (SentenceForm) and the server
// (app/api/contact/route.ts), so both give the same answer and the same messages.

export const TOPICS = [
  { id: 'internship', label: 'an internship',      subject: 'Internship' },
  { id: 'freelance',  label: 'a freelance project', subject: 'Freelance project' },
  { id: 'other',      label: 'something else',      subject: 'Something else' },
] as const

export type TopicId = (typeof TOPICS)[number]['id']
export const isTopic = (v: unknown): v is TopicId => TOPICS.some(t => t.id === v)
export const topicLabel = (id: TopicId) => TOPICS.find(t => t.id === id)!.label

export const MAX = { name: 100, email: 200, message: 5000 } as const

/** In the order they appear in the sentence: focus goes to the first invalid one */
export const FIELDS = ['name', 'topic', 'message', 'email'] as const
export type Field = (typeof FIELDS)[number]
export type ContactFields = Record<Field, string>
export type FieldErrors = Partial<Record<Field, string>>

// No whitespace, quotes, angle brackets, commas or semicolons: the address goes into Reply-To as is
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/

/**
 * Trims and drops control characters. The message keeps its line breaks and tabs; the
 * single-line fields keep nothing, so no value can carry a line break into an email header.
 */
export function clean(field: Field, value: unknown): string {
  if (typeof value !== 'string') return ''
  const s = field === 'message'
    ? value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    : value.replace(/[\u0000-\u001F\u007F]/g, ' ')
  return s.trim()
}

/** The error for one (cleaned) value, or null */
export function validateField(field: Field, value: string): string | null {
  switch (field) {
    case 'name':
      if (!value) return 'Please tell me your name.'
      if (value.length > MAX.name) return `Please keep your name under ${MAX.name} characters.`
      return null
    case 'topic':
      return isTopic(value) ? null : 'Please pick what you’d like to talk about.'
    case 'message':
      if (!value) return 'Please write a short message.'
      if (value.length > MAX.message) return `Please keep the message under ${MAX.message} characters.`
      return null
    case 'email':
      if (!value) return 'Please add your email so I can reply.'
      if (value.length > MAX.email || !EMAIL_RE.test(value)) return 'That doesn’t look like an email address. Check for typos?'
      return null
  }
}

/** Cleans every field and returns the cleaned values and any errors */
export function validate(input: Record<string, unknown>): { values: ContactFields; errors: FieldErrors } {
  const values = Object.fromEntries(FIELDS.map(f => [f, clean(f, input[f])])) as ContactFields
  const errors: FieldErrors = {}
  for (const f of FIELDS) {
    const e = validateField(f, values[f])
    if (e) errors[f] = e
  }
  return { values, errors }
}
