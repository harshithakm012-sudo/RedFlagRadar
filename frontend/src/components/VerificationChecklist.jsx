export default function VerificationChecklist({ items, completed, onToggle }) {
  const remaining = items.filter((item) => !completed[item.id]).length

  return (
    <section className="panel checklist-panel" aria-labelledby="verify-title">
      <div className="section-heading checklist-heading">
        <div className="heading-icon verify-icon" aria-hidden="true">✓</div>
        <div><div className="eyebrow">VERIFY BEFORE YOU TRUST</div><h2 id="verify-title">Your verification plan</h2></div>
      </div>
      <p className="section-intro">Check each item using sources you find independently.</p>
      <div className="checklist-progress"><span>{remaining} checks remaining</span><span>{items.length - remaining} / {items.length}</span></div>
      <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax={items.length} aria-valuenow={items.length - remaining} aria-label="Verification checks completed">
        <span style={{ width: `${items.length ? ((items.length - remaining) / items.length) * 100 : 0}%` }} />
      </div>
      <div className="checklist-items">
        {items.map((item) => (
          <label className={`check-item ${completed[item.id] ? 'is-complete' : ''}`} key={item.id}>
            <input type="checkbox" checked={Boolean(completed[item.id])} onChange={() => onToggle(item.id)} />
            <span className="custom-check" aria-hidden="true">✓</span>
            <span className="check-copy"><strong>{item.title}</strong><small>{item.why}</small></span>
          </label>
        ))}
      </div>
      <div className={`checklist-recommendation ${remaining === 0 ? 'complete' : ''}`} role="status">
        <span className="recommendation-glyph" aria-hidden="true">{remaining === 0 ? '!' : 'i'}</span>
        <p>{remaining === 0
          ? 'You completed the checklist. This does not prove the offer or sender is genuine; keep using official channels.'
          : `${remaining} ${remaining === 1 ? 'check' : 'checks'} left. Pause before paying or sharing sensitive details.`}</p>
      </div>
      <p className="checklist-disclaimer">A checklist helps you investigate. It cannot verify an organization or prove an offer is genuine.</p>
    </section>
  )
}
