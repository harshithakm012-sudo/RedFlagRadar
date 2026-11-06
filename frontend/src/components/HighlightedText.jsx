const TERMS_BY_CODE = {
  payment_request: ['send money', 'wire transfer', 'bank transfer', 'deposit', 'payment', 'pay', 'fee'],
  sensitive_information: ['social security number', 'one-time code', 'bank details', 'card number', 'password', 'passcode', 'otp', 'ssn'],
  urgency: ['last chance', 'final notice', 'right now', 'immediately', 'urgent', 'today'],
  pressure_or_threat: ['legal action', 'lose your offer', 'lose your account', 'cancelled', 'canceled', 'terminated', 'report you'],
  unusually_attractive_claim: ['no experience required', 'risk-free', 'guaranteed', 'easy money'],
}

export default function HighlightedText({ text, findings = [] }) {
  const codes = new Set(findings.map((finding) => finding.code))
  const terms = [...new Set([...codes].flatMap((code) => TERMS_BY_CODE[code] || []))]
  if (terms.length === 0) return text

  const pattern = new RegExp(`(${terms.sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = []
  let cursor = 0
  let index = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index))
    parts.push(<mark className="evidence-highlight" key={`${match.index}-${index++}`}>{match[0]}</mark>)
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts.length ? parts : text
}
