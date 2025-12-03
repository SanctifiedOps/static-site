import { useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import "./App.css";

const transmissions = [
  {
    to: "9x...k3F",
    payload: '"You just received Static on Solana."',
    burn: "0.50 USD",
  },
  {
    to: "7Q...qV1",
    payload: '"Hash signed. Relay buried. No trace left."',
    burn: "0.82 USD",
  },
  {
    to: "5m...Xr9",
    payload: '"Payload delivered. Burn recorded on-chain."',
    burn: "1.25 USD",
  },
  {
    to: "C1...9zP",
    payload: '"Vault-to-vault whisper sent. Relay stable."',
    burn: "0.64 USD",
  },
];

const litepaperHref = "/litepaper.html";
const burnOptions = ["0.25", "0.75", "1.50"];
const recentTransmissionsSeed = [
  { to: "9x...k3F", burn: "0.50", status: "confirmed" },
  { to: "5m...Xr9", burn: "1.25", status: "confirmed" },
  { to: "C1...9zP", burn: "0.64", status: "confirming" },
  { to: "7Q...qV1", burn: "0.82", status: "confirmed" },
];
const recentTransmissions = [
  { to: "9x...k3F", burn: "0.50", status: "confirmed" },
  { to: "5m...Xr9", burn: "1.25", status: "confirmed" },
  { to: "C1...9zP", burn: "0.64", status: "confirming" },
  { to: "7Q...qV1", burn: "0.82", status: "confirmed" },
];

const BurnSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(burnOptions.indexOf(value) || 0);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setFocusIndex(burnOptions.indexOf(val));
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % burnOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + burnOptions.length) % burnOptions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(burnOptions[focusIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  return (
    <div className={`select-shell ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className="select-display"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select burn level"
      >
        {value} <span className="select-caret" aria-hidden="true">▾</span>
      </button>
      <div className="select-menu" role="listbox" aria-label="Burn level options">
        {burnOptions.map((opt, idx) => (
          <button
            type="button"
            key={opt}
            className={`select-option ${opt === value ? "active" : ""}`}
            data-focused={idx === focusIndex}
            onClick={() => handleSelect(opt)}
            onMouseEnter={() => setFocusIndex(idx)}
            >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [walletError, setWalletError] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [burnTier, setBurnTier] = useState("0.75");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendPhase, setSendPhase] = useState("idle"); // idle | preparing | confirming | done
  const [toasts, setToasts] = useState([]);
  const [tickerItems, setTickerItems] = useState(recentTransmissionsSeed);
  const { publicKey, connected, connecting, connect, disconnect, wallets, wallet, select } =
    useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % transmissions.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Seed ticker on load (replace with on-chain fetch in production)
    setTickerItems(recentTransmissionsSeed);
  }, []);

  const walletAddr = publicKey ? publicKey.toString() : "";

  const handleConnect = async () => {
    setWalletError("");
    try {
      if (wallet && (wallet.adapter.readyState === "Installed" || wallet.adapter.readyState === "Loadable")) {
        await connect();
        addToast("Wallet connected.", "success");
        return;
      }
      const ready = wallets.find((w) =>
        ["Installed", "Loadable"].includes(w.readyState)
      );
      if (ready) {
        select(ready.adapter.name);
        setVisible(true);
        return;
      }
      setVisible(true);
      setWalletError("No wallet detected. Install Phantom or Solflare.");
    } catch (err) {
      setWalletError(err?.message || "Wallet connection failed.");
      addToast("Wallet connection failed.", "error");
    }
  };

  const handleDisconnect = async () => {
    setWalletError("");
    try {
      await disconnect();
      addToast("Wallet disconnected.", "info");
    } catch (err) {
      setWalletError(err?.message || "Disconnect failed.");
      addToast("Disconnect failed.", "error");
    }
  };

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

  const walletButtonLabel = connecting
    ? "Connecting..."
    : walletAddr
      ? `Connected ${formatAddress(walletAddr)}`
      : "Connect Wallet";

  const addToast = (text, tone = "info") => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -5% 0px" }
    );

    const targets = document.querySelectorAll("[data-anim]");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const active = transmissions[activeIndex];

  const handleSend = async (event) => {
    event.preventDefault();
    setSendError("");
    setSendStatus("");
    setSendPhase("preparing");

    if (!connected || !walletAddr) {
      setSendError("Connect a wallet first.");
      await handleConnect();
      setSendPhase("idle");
      return;
    }

    try {
      new PublicKey(recipient);
    } catch (err) {
      setSendError("Recipient address is invalid.");
      setSendPhase("idle");
      return;
    }

    if (!message.trim()) {
      setSendError("Add a message payload to send.");
      setSendPhase("idle");
      return;
    }

    setSending(true);
    try {
      const sig = `stub-${Date.now().toString(16)}`;
      const newItem = {
        to: `${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
        burn: burnTier,
        status: "confirming",
        sig,
      };
      setTickerItems((prev) => [...prev.slice(-6), newItem]); // keep latest ~7

      // Placeholder: integrate encryption, storage upload, burn + mint instruction here.
      setSendStatus(
        "Stub: encrypt message, upload ciphertext URI, burn $STATIC, and mint NFT to recipient via your program."
      );
      setSendPhase("confirming");
      addToast("Transmission prepared (stub). Wire program to send.", "success");
      setTimeout(() => {
        setTickerItems((prev) =>
          prev.map((item) =>
            item.sig === sig ? { ...item, status: "confirmed" } : item
          )
        );
        setSendStatus("Stub: confirmed.");
        setSendPhase("done");
        addToast("Transmission marked confirmed (stub).", "info");
        setTimeout(() => setSendPhase("idle"), 1200);
      }, 1400);
      // TODO: replace with real transaction build & send when program is ready.
    } catch (err) {
      setSendError(err?.message || "Send failed.");
      addToast("Send failed.", "error");
    } finally {
      setSending(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app">
      <div className="frame">
        <div className="bg-gradient" aria-hidden="true" />
        <div className="hud-grid" aria-hidden="true">
          <div className="scanline" />
        </div>
        <div className="particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}
        <header className="nav">
          <div className="nav-logo">STATIC</div>
          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#send" onClick={closeMenu}>
              Send
            </a>
            <a href="#how" onClick={closeMenu}>
              How it works
            </a>
            <a href="#pricing" onClick={closeMenu}>
              Pricing
            </a>
            <a href="#faq" onClick={closeMenu}>
              FAQ
            </a>
          </nav>
          <button
            className="nav-cta"
            onClick={walletAddr ? handleDisconnect : handleConnect}
            disabled={connecting}
          >
            {walletButtonLabel}
          </button>
        </header>

        <main className="main">
          <section className="hero">
            <div className="hero-text" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Dark-web transmissions for Solana</p>
              <h1>Send Static on Solana.</h1>
              <p className="hero-subtitle">
                Mint anonymous NFT messages, route them through a ghost relay,
                and burn $STATIC with every transmission.
              </p>
              <div className="wallet-status-card" data-anim style={{ "--delay": "0.16s" }}>
                <div className={`status-dot ${walletAddr ? "on" : "off"}`} />
                <div className="wallet-status-copy">
                  <p className="wallet-label">Wallet</p>
                  <p className="wallet-value">
                    {walletAddr ? formatAddress(walletAddr) : "Not connected"}
                  </p>
                  {walletError && <p className="wallet-error">{walletError}</p>}
                </div>
                <button
                  className="wallet-btn"
                  onClick={walletAddr ? handleDisconnect : handleConnect}
                  disabled={connecting}
                >
                  {connecting ? "Connecting..." : walletAddr ? "Disconnect" : "Connect"}
                </button>
              </div>
              <div className="hero-meta">
                <span>Zero trace. Central relay. Real burns.</span>
              </div>
            </div>

            <div className="hero-panel slide-up" data-anim style={{ "--delay": "0.15s" }}>
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
                  <div className="field-value">{active.to}</div>
                </div>
                <div className="panel-field">
                  <label>Payload</label>
                  <div className="field-message pulse">{active.payload}</div>
                </div>
                <div className="panel-footer">
                  <span>Burn: {active.burn} in $STATIC</span>
                  <span>Trace risk: 0%</span>
                </div>
                <div className="signal-meter" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="ticker" aria-label="Recent transmissions">
            <div className="ticker-track">
              {tickerItems.concat(tickerItems).map((tx, idx) => (
                <div className="ticker-item" key={`${tx.to}-${tx.burn}-${idx}`}>
                  <span className="dot" />
                  <span className="label">To</span>
                  <span className="val">{tx.to}</span>
                  <span className="label">Burn</span>
                  <span className="val">${tx.burn}</span>
                  <span className={`status-chip-mini ${tx.status}`}>{tx.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="transmit" id="send">
            <div className="transmit-card" data-anim style={{ "--delay": "0.05s" }}>
              <div className="transmit-header">
                <p className="eyebrow">Send</p>
                <h2>Mint an anonymous NFT message</h2>
                <p className="section-subtitle">
                  Choose a burn level, encrypt the payload, and drop it to the recipient wallet.
                </p>
              </div>
              <form className="transmit-form" onSubmit={handleSend}>
                <div className="form-row">
                  <label className="has-tip">
                    Recipient wallet
                    <span className="tip">Where the NFT message will be delivered.</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Recipient address (e.g. 9x...k3F)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="has-tip">
                    Message payload
                    <span className="tip">Content is encrypted off-chain before minting.</span>
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Type the encrypted message you want to send..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="form-row inline">
                  <div>
                    <label className="has-tip">
                      Burn level (USD)
                      <span className="tip">Each send burns $STATIC at this USD value.</span>
                    </label>
                    <BurnSelect value={burnTier} onChange={setBurnTier} />
                  </div>
                  <div>
                    <label>Status</label>
                    <div className="status-chip">
                      {sending ? "Preparing transaction..." : sendStatus || "Ready"}
                    </div>
                  </div>
                </div>
                {sendError && <p className="wallet-error">{sendError}</p>}
                <div className="form-actions">
                  <button className="primary-btn" type="submit" disabled={sending}>
                    {sending ? "Sending..." : walletAddr ? "Send transmission" : "Connect to send"}
                  </button>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={walletAddr ? handleDisconnect : handleConnect}
                    disabled={connecting}
                  >
                    {walletAddr ? "Disconnect" : walletButtonLabel}
                  </button>
                </div>
                <div className={`send-meter ${sendPhase !== "idle" ? "active" : ""}`} aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </form>
              <div className="toast-stack local" aria-live="polite">
                {toasts.map((t) => (
                  <div key={t.id} className={`toast ${t.tone}`} role="status">
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="info-grid" id="how">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Blueprint</p>
              <h2>How Static moves messages</h2>
              <p className="section-subtitle">
                Obscure payloads, timestamp burns, and route through a single
                ghost relay to keep origin hidden without sacrificing speed.
              </p>
            </div>
            <div className="info-cards">
              <article className="info-card" data-anim style={{ "--delay": "0.08s" }}>
                <p className="card-eyebrow">01 / Mint</p>
                <h3>Encode & seal</h3>
                <p>
                  Messages are minted as ephemeral NFTs with self-destruction on
                  read. Relay only sees encrypted envelopes.
                </p>
              </article>
              <article className="info-card" data-anim style={{ "--delay": "0.14s" }}>
                <p className="card-eyebrow">02 / Relay</p>
                <h3>Ghost routing</h3>
                <p>
                  A single blinded hop forwards to the recipient. No multi-hop
                  breadcrumbs. No discoverable path.
                </p>
              </article>
              <article className="info-card" data-anim style={{ "--delay": "0.2s" }}>
                <p className="card-eyebrow">03 / Burn</p>
                <h3>Prove the cost</h3>
                <p>
                  Every send burns $STATIC. The burn receipt is the only public
                  footprint, linking cost to velocity, not identity.
                </p>
              </article>
            </div>
          </section>

          <section className="pricing" id="pricing">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Pricing</p>
              <h2>Choose your burn level</h2>
              <p className="section-subtitle">
                Fixed relay fee with flexible burns. Turn the heat up or keep it
                lean; every transmission pays its way.
              </p>
            </div>
            <div className="pricing-cards">
              <article className="pricing-card" data-anim style={{ "--delay": "0.08s" }}>
                <p className="card-eyebrow">Starter</p>
                <h3>0.25 USD burn</h3>
                <p>Low-friction whispers for testing or low-signal pings.</p>
                <ul>
                  <li>Ghost relay access</li>
                  <li>Standard encryption</li>
                  <li>1 recipient</li>
                </ul>
              </article>
              <article className="pricing-card featured" data-anim style={{ "--delay": "0.14s" }}>
                <p className="card-eyebrow">Operator</p>
                <h3>0.75 USD burn</h3>
                <p>For operators running silent but needing verifiable burns.</p>
                <ul>
                  <li>Priority relay lane</li>
                  <li>Dual recipients</li>
                  <li>Signal health telemetry</li>
                </ul>
              </article>
              <article className="pricing-card" data-anim style={{ "--delay": "0.2s" }}>
                <p className="card-eyebrow">Ghost</p>
                <h3>1.50 USD burn</h3>
                <p>Highest burn, fastest clearance, deepest obfuscation.</p>
                <ul>
                  <li>Dedicated relay slot</li>
                  <li>Multi-recipient fan-out</li>
                  <li>Priority support</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="faq" id="faq">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">FAQ</p>
              <h2>Trust the signal</h2>
              <p className="section-subtitle">
                A quick primer on why Static stays private while keeping burns
                verifiable.
              </p>
            </div>
            <div className="faq-grid">
              <article className="faq-item" data-anim style={{ "--delay": "0.08s" }}>
                <h3>Why a single relay?</h3>
                <p>
                  One hop means fewer breadcrumbs. Static uses a blinded relay
                  with no routing table exposure, then proofs the burn on-chain.
                </p>
              </article>
              <article className="faq-item" data-anim style={{ "--delay": "0.12s" }}>
                <h3>What burns on every send?</h3>
                <p>
                  Every payload destroys $STATIC. The burn cost can be tuned per
                  message to signal urgency without leaking sender identity.
                </p>
              </article>
              <article className="faq-item" data-anim style={{ "--delay": "0.16s" }}>
                <h3>How do recipients read?</h3>
                <p>
                  Recipients decrypt directly from the NFT envelope. The relay
                  never touches plaintext, and messages self-destruct after
                  confirmation.
                </p>
              </article>
              <article className="faq-item" data-anim style={{ "--delay": "0.2s" }}>
                <h3>Is this live?</h3>
                <p>
                  The network is in dry run. Join the waitlist to get the first
                  production endpoint and a pre-flight burn voucher.
                </p>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
