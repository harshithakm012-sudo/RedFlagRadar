import { useState } from 'react'

function chooseGuidance(result, isUrlReview) {
  if (isUrlReview) {
    return {
      title: 'Do not open this link from the message.',
      message: "If you need to check the claim, type the organization's known address yourself and look for the information there.",
      button: 'Copy safe reminder',
    }
  }

  const codes = new Set((result.evidence || []).map((item) => item.code))
  if (codes.has('sensitive_information')) {
    return {
      title: 'Keep credentials and financial details private.',
      message: "I won't share passwords, one-time codes, or financial details by message. I'll contact the organization through a channel I find independently.",
      button: 'Copy suggested reply',
    }
  }
  if (codes.has('payment_request') || codes.has('payment_after_offer')) {
    return {
      title: 'Pause before paying any fee.',
      message: "I don't pay fees to secure an offer. Please point me to the official listing and fee policy. I'll verify them through contact details I find independently.",
      button: 'Copy suggested reply',
    }
  }
  if (codes.has('urgency') || codes.has('pressure_or_threat') || codes.has('increasing_urgency')) {
    return {
      title: 'Give yourself time to verify.',
      message: "I can't act on a deadline until I've verified it. I'll confirm the details through an official channel I find independently.",
      button: 'Copy suggested reply',
    }
  }
  return {
    title: 'Verify before taking action.',
    message: "Thanks. I'll review the details and verify them through an official channel I find independently before taking action.",
    button: 'Copy suggested reply',
  }
}

export default function NextMoveCoach({ result, isUrlReview }) {
  const [copyStatus, setCopyStatus] = useState('')
  const guidance = chooseGuidance(result, isUrlReview)

  async function copyGuidance() {
    try {
      await navigator.clipboard.writeText(guidance.message)
      setCopyStatus('Copied. You can edit this before using it.')
    } catch {
      setCopyStatus('Copy is unavailable here. Select the suggested text to copy it.')
    }
  }

  return (
    <section className="panel next-move-panel" aria-labelledby="next-move-title">
      <div className="section-heading">
        <div className="heading-icon next-move-icon" aria-hidden="true">↗</div>
        <div><div className="eyebrow">YOUR NEXT MOVE</div><h2 id="next-move-title">A safer way to respond</h2></div>
      </div>
      <strong className="next-move-title">{guidance.title}</strong>
      <p className="next-move-message">{guidance.message}</p>
      <div className="next-move-actions">
        <button type="button" className="copy-guidance-button" onClick={copyGuidance}>{guidance.button}</button>
        <span role="status" aria-live="polite">{copyStatus}</span>
      </div>
      <p className="next-move-note">Optional guidance. You do not need to reply. This does not verify who sent the message.</p>
    </section>
  )
}
