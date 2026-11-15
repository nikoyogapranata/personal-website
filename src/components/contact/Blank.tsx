'use client'

type Props = {
  id: string
  label: string
  placeholder: string
  value: string
  error?: string
  multiline?: boolean
  /** Punctuation that follows the blank; kept on its line so it never starts a new one */
  suffix?: string
  onChange: (value: string) => void
  onBlur: () => void
  ref?: React.Ref<HTMLInputElement & HTMLTextAreaElement>
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'value'>

/**
 * One blank in the sentence: a visually hidden label, the field drawn as an underline, and its
 * error underneath. The field sizes itself in CSS: an invisible copy of its text (or placeholder)
 * sits in the same grid cell and sets the width, and for the message the height too, so the
 * server render and the hydrated page have the same size and nothing shifts.
 */
export default function Blank({ id, label, placeholder, value, error, multiline, suffix, onChange, onBlur, ref, ...rest }: Props) {
  const errorId = `${id}-error`
  const common = {
    id,
    name: id.replace('contact-', ''),
    placeholder,
    value,
    className: 'sf-field',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    onBlur,
  }
  return (
    <span className={`sf-blank${multiline ? ' sf-blank--multi' : ''}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <span className="sf-row">
        <span className="sf-cell">
          {/* Trailing hair space: room for the caret, and keeps a final empty line of the message */}
          <span className="sf-mirror" aria-hidden="true">{(value || placeholder) + ' '}</span>
          {multiline ? (
            <textarea
              {...common}
              ref={ref}
              rows={1}
              maxLength={rest.maxLength}
              onChange={e => onChange(e.target.value)}
            />
          ) : (
            <input
              {...common}
              {...rest}
              ref={ref}
              onChange={e => onChange(e.target.value)}
            />
          )}
        </span>
        {suffix && <span className="sf-suffix">{suffix}</span>}
      </span>
      {error && <span id={errorId} className="sf-error">{error}</span>}
    </span>
  )
}
