import { useMemo, useState } from 'react'
import BrandBar from './components/BrandBar.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const EXAMPLES = {
  single: 'Congratulations! You have been selected for our internship. Pay a registration fee immediately to reserve your position.',
  conversation: [
    'Congratulations! You have been selected for an internship.',
    'Please pay a registration fee to reserve your position.',
    'Pay immediately or your offer will be cancelled.',
  ].join('\n'),
}

export default function App() {
  const [mode, setMode] = useState('single')
  const [singleKind, setSingleKind] = useState('message')
  const [singleText, setSingleText] = useState('')
  const [conversationText, setConversationText] = useState('')
  const [result, setResult] = useState(null)
  const [analyzedText, setAnalyzedText] = useState('')
  const [analyzedMessages, setAnalyzedMessages] = useState([])
  const [checklistState, setChecklistState] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const messages = useMemo(() => conversationText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean), [conversationText])
  const activeText = mode === 'conversation' ? conversationText : singleText
  const hasInput = activeText.trim().length > 0

  function chooseMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  function loadExample() {
    if (mode === 'conversation') setConversationText(EXAMPLES.conversation)
    else if (singleKind === 'url') setSingleText('http://example.invalid/apply-now')
    else setSingleText(EXAMPLES.single)
    setError('')
  }

  async function submitAnalysis(event) {
    event.preventDefault()
    setError('')
    if (mode === 'conversation' && messages.length === 0) return setError('Add at least one message. Put each message on its own line to preserve order.')
    if (mode === 'conversation' && messages.length > 20) return setError('A conversation can contain up to 20 messages.')
    if (mode === 'conversation' && messages.some((message) => message.length > 10000)) return setError('Each message must be 10,000 characters or fewer.')
    if (mode === 'single' && singleText.trim().length === 0) return setError(singleKind === 'url' ? 'Enter a URL to review.' : 'Enter a message to review.')
    if (mode === 'single' && singleText.length > 10000) return setError('Input must be 10,000 characters or fewer.')
    if (mode === 'single' && singleKind === 'url' && !/^https?:\/\//i.test(singleText.trim())) return setError('Enter a full URL beginning with http:// or https://.')

    const request = mode === 'conversation'
      ? { mode, messages: messages.map((text) => ({ text, timestamp: null })) }
      : singleKind === 'url'
        ? { mode: 'url', url: singleText.trim() }
        : { mode: 'single', message: singleText.trim() }

    setLoading(true)
    setResult(null)
    setAnalyzedText('')
    setAnalyzedMessages([])
    setChecklistState({})
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(request),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || `Analysis service returned HTTP ${response.status}.`)
      setResult(data)
      setAnalyzedText(mode === 'single' && singleKind === 'message' ? singleText.trim() : '')
      setAnalyzedMessages(mode === 'conversation' ? messages : [])
      setChecklistState(Object.fromEntries((data.verificationChecklist || []).map((item) => [item.id, false])))
    } catch (cause) {
      setResult(null)
      setAnalyzedText('')
      setAnalyzedMessages([])
      setChecklistState({})
      setError(cause instanceof TypeError
        ? `Could not reach the Red Flag Radar API at ${API_BASE_URL}. Make sure the Java service is running.`
        : cause.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function toggleChecklistItem(id) {
    setChecklistState((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <div className="app-shell" id="top">
      <div className="ambient-grid" aria-hidden="true" />
      <BrandBar />
      <main className="page-wrap">
        <section className="hero">
          <div className="hero-copy"><div className="hero-kicker"><span /> YOUR HUMAN-FIRST SCAM CHECK</div>
            <h1>Pause. Look closer.<br /><em>Trust your radar.</em></h1>
            <p>Spot pressure tactics and suspicious requests with clear evidence and practical ways to verify.</p>
          </div>
          <div className="radar-visual" aria-hidden="true"><div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-ring ring-three" /><div className="radar-sweep" /><span className="radar-center" /><span className="radar-blip blip-one" /><span className="radar-blip blip-two" /><span className="radar-cross cross-one" /><span className="radar-cross cross-two" /></div>
        </section>

        <div className="workspace-grid">
          <section className="panel analyzer-panel" aria-labelledby="analyzer-title">
            <div className="panel-topline"><div className="eyebrow">START WITH WHAT YOU RECEIVED</div><span className="step-label"><b>01</b> / ANALYZE</span></div>
            <h2 className="analyzer-title" id="analyzer-title">What would you like to check?</h2>
            <div className="mode-switch" role="group" aria-label="Choose analysis mode">
              <button type="button" aria-pressed={mode === 'single'} className={mode === 'single' ? 'active' : ''} onClick={() => chooseMode('single')}><span className="tab-icon" aria-hidden="true">◉</span>Analyze a message</button>
              <button type="button" aria-pressed={mode === 'conversation'} className={mode === 'conversation' ? 'active' : ''} onClick={() => chooseMode('conversation')}><span className="tab-icon" aria-hidden="true">☷</span>Analyze a conversation</button>
            </div>

            {mode === 'single' ? <>
              <div className="input-kind-switch" role="group" aria-label="Choose what to analyze">
                <button type="button" className={singleKind === 'message' ? 'selected' : ''} onClick={() => { setSingleKind('message'); setSingleText('') }}>Message / offer</button>
                <button type="button" className={singleKind === 'url' ? 'selected' : ''} onClick={() => { setSingleKind('url'); setSingleText('') }}>URL pattern</button>
              </div>
              <label className="field-label" htmlFor="single-input">{singleKind === 'url' ? 'Suspicious URL' : 'Paste the message or offer'}</label>
              <textarea id="single-input" className="message-input single-input" value={singleText} onChange={(event) => setSingleText(event.target.value)} maxLength={10000} placeholder={singleKind === 'url' ? 'https://example.com/offer' : 'Paste the message, email, offer, or payment request here…'} />
              <div className="input-meta"><span>{singleKind === 'url' ? 'We inspect URL text only. The site will not be opened.' : 'Your message is sent to your local Red Flag Radar API for analysis.'}</span><span>{singleText.length.toLocaleString()} / 10,000</span></div>
            </> : <>
              <label className="field-label" htmlFor="conversation-input">Paste the messages in order</label>
              <textarea id="conversation-input" className="message-input conversation-input" value={conversationText} onChange={(event) => setConversationText(event.target.value)} placeholder={'Message 1 — paste the first message\nMessage 2 — paste the next message\nMessage 3 — and so on'} />
              <div className="input-meta"><span>One message per line. Their order is preserved.</span><span>{messages.length} / 20 messages</span></div>
            </>}

            <div className="form-actions"><button type="button" className="example-button" onClick={loadExample}><span aria-hidden="true">＋</span> Try an example</button><button type="submit" form="analysis-form" className="analyze-button" disabled={loading || !hasInput}>{loading ? <><span className="spinner" />Analyzing…</> : <>Analyze safely <span aria-hidden="true">↗</span></>}</button></div>
            <form id="analysis-form" onSubmit={submitAnalysis} />
            {error && <div className="error-banner" role="alert"><span aria-hidden="true">!</span><p>{error}</p></div>}
            {loading && <p className="loading-note" role="status">Reviewing the text with local explainable rules…</p>}
            <div className="local-note"><span className="lock-icon" aria-hidden="true">⌑</span><p>Submitted content is analyzed by your local services and is not saved by this interface. Never include passwords, OTPs, or payment credentials.</p></div>
          </section>

          <aside className="side-note-column" aria-label="How to use Red Flag Radar">
            <div className="side-note"><span className="side-index">A</span><div><strong>Evidence over labels</strong><p>See which signs raised concern and why they matter.</p></div></div>
            <div className="side-note"><span className="side-index">B</span><div><strong>Check the whole story</strong><p>Spot when a conversation shifts toward pressure or payment.</p></div></div>
            <div className="side-note"><span className="side-index">C</span><div><strong>Verify independently</strong><p>Use sources you find yourself. We never open suspicious links.</p></div></div>
            <div className="score-note"><span className="score-note-glyph" aria-hidden="true">◌</span><p>Risk scores are <strong>heuristic estimates</strong>, never probabilities or proof of fraud.</p></div>
          </aside>
        </div>

        {result ? <div className="results-layout"><div className="results-title"><div><div className="eyebrow">ANALYSIS COMPLETE</div><h2>Here’s what the radar picked up</h2></div><button type="button" className="reset-button" onClick={() => { setResult(null); setAnalyzedText(''); setError(''); setAnalyzedMessages([]) }}>New analysis <span aria-hidden="true">↻</span></button></div><ResultsPanel result={result} conversationMessages={analyzedMessages} analyzedText={analyzedText} checklistState={checklistState} onChecklistToggle={toggleChecklistItem} /></div> : <section className="empty-state"><span className="empty-radar" aria-hidden="true">◎</span><div><strong>Your findings will appear here</strong><p>Start with a message, offer, URL, or conversation. We’ll show the evidence and suggested checks.</p></div><span className="empty-state-tag">READY WHEN YOU ARE</span></section>}
      </main>
      <footer className="footer"><span>RED FLAG RADAR <i>·</i> SPOT THE SIGNS. STOP THE SCAMS.</span><span>Heuristic signals can be wrong. Verify important claims independently.</span></footer>
    </div>
  )
}
