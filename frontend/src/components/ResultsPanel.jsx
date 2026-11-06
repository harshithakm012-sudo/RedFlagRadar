import VerificationChecklist from './VerificationChecklist.jsx'
import HighlightedText from './HighlightedText.jsx'
import NextMoveCoach from './NextMoveCoach.jsx'

function RiskGauge({ score, level }) {
  const tone = (level || 'Low').toLowerCase()
  return (
    <div className={`risk-card risk-${tone}`}>
      <div className="risk-card-top"><span className="eyebrow">HEURISTIC RISK ESTIMATE</span><span className="risk-level"><span />{level} risk</span></div>
      <div className="score-row"><strong>{score}</strong><span className="score-max">/ 100</span><span className="score-caption">Signal score<br />not a probability</span></div>
      <div className="score-track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={score} aria-valuetext={`${score} out of 100, heuristic estimate`}><span style={{ width: `${score}%` }} /></div>
    </div>
  )
}

function EvidenceCard({ evidence, title = 'What raised a flag' }) {
  return (
    <section className="panel evidence-panel" aria-labelledby="evidence-title">
      <div className="section-heading"><div className="heading-icon flag-icon" aria-hidden="true">⚑</div><div><div className="eyebrow">THE SIGNALS</div><h2 id="evidence-title">{title}</h2></div></div>
      {evidence.length ? <ul className="evidence-list">{evidence.map((item, index) => (
        <li className="evidence-item" key={`${item.code}-${item.messageIndex}-${index}`}>
          <span className="evidence-line" aria-hidden="true" />
          <div><span className="evidence-code">{item.code.replaceAll('_', ' ')}</span><p>{item.explanation || item.text}</p>{item.messageIndex !== null && item.messageIndex !== undefined && <small>Message {item.messageIndex + 1}</small>}</div>
        </li>
      ))}</ul> : <div className="empty-evidence"><span aria-hidden="true">✓</span><div><strong>No strong warning signs detected</strong><p>Basic rules found no clear signals. That does not confirm the message is safe.</p></div></div>}
    </section>
  )
}

function ConversationTimeline({ messages, findings }) {
  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="section-heading"><div className="heading-icon timeline-icon" aria-hidden="true">◷</div><div><div className="eyebrow">STORYLINE DETECTOR</div><h2 id="timeline-title">Conversation timeline</h2></div></div>
      <ol className="timeline-list">{messages.map((message, index) => {
        const result = findings.find((finding) => finding.messageIndex === index)
        const flags = result?.evidence || []
        return <li className="timeline-entry" key={`${index}-${message.slice(0, 18)}`}>
          <span className={`timeline-marker ${flags.length ? 'has-flags' : ''}`} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="timeline-content"><div className="timeline-meta"><span>MESSAGE {String(index + 1).padStart(2, '0')}</span><span className={`mini-risk ${(result?.riskLevel || 'Low').toLowerCase()}`}>{result?.riskLevel || 'Low'} signal</span></div>
            <p><HighlightedText text={message} findings={flags} /></p>{flags.length > 0 && <div className="timeline-flags">{flags.map((flag, flagIndex) => <span key={`${flag.code}-${flagIndex}`}>{flag.code.replaceAll('_', ' ')}</span>)}</div>}
          </div>
        </li>
      })}</ol>
    </section>
  )
}

export default function ResultsPanel({ result, conversationMessages, analyzedText, checklistState, onChecklistToggle }) {
  const isUrlReview = !conversationMessages.length && !analyzedText
  return (
    <div className="results-column" aria-live="polite">
      <RiskGauge score={result.riskScore} level={result.riskLevel} />
      <NextMoveCoach result={result} isUrlReview={isUrlReview} />
      <div className="summary-banner"><span className="summary-spark" aria-hidden="true">✳</span><p>{result.summary}</p></div>
      {conversationMessages.length > 0 && <ConversationTimeline messages={conversationMessages} findings={result.messageFindings || []} />}
      {analyzedText && <section className="panel excerpt-panel" aria-labelledby="excerpt-title"><div className="section-heading"><div className="heading-icon excerpt-icon" aria-hidden="true">⌕</div><div><div className="eyebrow">MESSAGE REVIEW</div><h2 id="excerpt-title">Evidence in context</h2></div></div><p className="excerpt-text"><HighlightedText text={analyzedText} findings={result.evidence || []} /></p><p className="highlight-legend"><span /> Highlighted wording matches a rule that contributed to the assessment.</p></section>}
      {result.patterns?.length > 0 && <section className="panel pattern-panel" aria-labelledby="pattern-title"><div className="section-heading"><div className="heading-icon pattern-icon" aria-hidden="true">⌁</div><div><div className="eyebrow">COMBINATION OF MESSAGES</div><h2 id="pattern-title">Storyline patterns</h2></div></div><ul className="pattern-list">{result.patterns.map((pattern) => <li key={pattern.code}><span>{pattern.code.replaceAll('_', ' ')}</span><p>{pattern.message}</p></li>)}</ul><p className="pattern-caveat">A pattern is a reason to verify, not a verdict by itself.</p></section>}
      <EvidenceCard evidence={result.evidence || []} />
      <section className="panel next-steps-panel">
        <div className="section-heading"><div className="heading-icon steps-icon" aria-hidden="true">↗</div><div><div className="eyebrow">STAY IN CONTROL</div><h2>Safer next steps</h2></div></div>
        <ul className="recommendation-list">{(result.recommendations || []).map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ul>
      </section>
      {result.verificationChecklist?.length > 0 && <VerificationChecklist items={result.verificationChecklist} completed={checklistState} onToggle={onChecklistToggle} />}
      <p className="result-footnote">This score is a heuristic estimate, not a probability of fraud. False positives and missed warning signs are possible.</p>
    </div>
  )
}
