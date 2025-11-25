import "./App.css";

const App = () => {
  return (
    <div className="app">
      <div className="frame">
        <header className="nav">
          <div className="nav-logo">STATIC</div>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="nav-cta" disabled>Launch dApp</button>
        </header>

        <main className="main">
          <section className="hero">
            <div className="hero-text">
              <p className="eyebrow">Dark-web transmissions for Solana</p>
              <h1>Send Static on Solana.</h1>
              <p className="hero-subtitle">
                Mint anonymous NFT messages, route them through a ghost relay,
                and burn $STATIC with every transmission.
              </p>
              <div className="hero-actions">
                <button className="primary-btn" disabled>Launch dApp (soon)</button>
                <button className="secondary-btn">Read litepaper</button>
              </div>
              <div className="hero-meta">
                <span>Zero trace. Central relay. Real burns.</span>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-header">
                <span className="panel-title">Static Transmission</span>
                <span className="panel-status">LIVE</span>
              </div>
              <div className="panel-body">
                <div className="panel-field">
                  <label>From</label>
                  <div className="field-value">Ghost Relay</div>
                </div>
                <div className="panel-field">
                  <label>To</label>
                  <div className="field-value">9x...k3F</div>
                </div>
                <div className="panel-field">
                  <label>Payload</label>
                  <div className="field-message">
                    &quot;You just received Static on Solana.&quot;
                  </div>
                </div>
                <div className="panel-footer">
                  <span>Burn: 0.50 USD in $STATIC</span>
                  <span>Trace risk: 0%</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
