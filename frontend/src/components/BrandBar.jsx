export default function BrandBar() {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Red Flag Radar home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span className="brand-copy"><strong>RED FLAG <i>RADAR</i></strong><small>SPOT THE SIGNS. STOP THE SCAMS.</small></span>
      </a>
      <div className="privacy-note"><span className="privacy-dot" /> Private by design <span className="topbar-divider">/</span> No links opened</div>
    </header>
  )
}
