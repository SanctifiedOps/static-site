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
const burnOptions = [
  { value: "0.25", label: "Starter", desc: "Low-friction whispers" },
  { value: "0.75", label: "Operator", desc: "Priority relay" },
  { value: "1.50", label: "Ghost", desc: "Fastest, deepest obfuscation" },
];
const recentTransmissionsSeed = [
  { to: "9x...k3F", burn: "0.50", status: "confirmed" },
  { to: "5m...Xr9", burn: "1.25", status: "confirmed" },
  { to: "C1...9zP", burn: "0.64", status: "confirming" },
  { to: "7Q...qV1", burn: "0.82", status: "confirmed" },
];

const healthStats = [
  { label: "Relay uptime", value: "99.9%", tone: "good", desc: "Blinded hop online with automated failover." },
  { label: "Median latency", value: "420 ms", tone: "warn", desc: "Single-hop relay tuned for low jitter." },
  { label: "Burned last 24h", value: "$2.7k", tone: "good", desc: "Cost proof recorded for every send." },
  { label: "Messages today", value: "1,842", tone: "info", desc: "Encrypted payloads delivered via NFT envelopes." },
  { label: "Success rate", value: "99.2%", tone: "good", desc: "Confirmed transmissions over the last 24h." },
];
const recentTransmissions = [
  { to: "9x...k3F", burn: "0.50", status: "confirmed" },
  { to: "5m...Xr9", burn: "1.25", status: "confirmed" },
  { to: "C1...9zP", burn: "0.64", status: "confirming" },
  { to: "7Q...qV1", burn: "0.82", status: "confirmed" },
];

const roadmap = [
  { title: "Audit", status: "In progress", desc: "Third-party review of relay and burn logic." },
  { title: "Devnet", status: "Live", desc: "Staging relay, test $STATIC burn, telemetry enabled." },
  { title: "Mainnet", status: "Planned", desc: "Production relay with SLAs and rate limits." },
  { title: "Upcoming", status: "Queued", desc: "Recipient UI, relayer marketplace, mobile client." },
];

const recipientSteps = [
  { title: "Detect", text: "Wallet sees NFT envelope and fetches the encrypted payload URI." },
  { title: "Decrypt", text: "ECDH-derived key (recipient priv + sender ephemeral pub) unlocks AES-GCM." },
  { title: "Self-destruct", text: "After confirmation, the envelope is marked consumed and hidden." },
  { title: "Open in wallet", text: 'Single-click "View message" in a supported wallet/read client.' },
];

const devHooks = [
  { title: "Program ID", text: "STATIC_PROGRAM_ID (replace with deployed ID)", badge: "Anchor" },
  { title: "Send instruction", text: "send_message { recipient, burn_amount, payload_uri }", badge: "Instruction" },
  { title: "Events", text: "MessageSent { recipient, burn, payload_hash }", badge: "Logs" },
  { title: "Quickstart", text: "Call via web3.js: build tx + add burn ix + send_message + confirm", badge: "SDK" },
];

const testimonials = [
  { quote: "We move ops chatter through Static to avoid breadcrumb trails. The burn is our proof.", author: "Ops lead, dark market team" },
  { quote: "Single-hop relay keeps latency low; we can't afford multi-hop lag.", author: "DeFi incident responder" },
  { quote: "Encrypted envelopes + burns give us verifiable delivery without revealing our desks.", author: "Vault-to-vault comms" },
];

const checklist = [
  "Security review & audit underway",
  "Rate limiting and anti-abuse guards",
  "Relay uptime targets with failover",
  "Devnet staging with test $STATIC",
  "Recipient UX in design",
  "Relayer marketplace planned",
];

const extraFaq = [
  { q: "What happens if a send fails?", a: "Transaction fails without burn; retry after checking relay status. When live, relayer will expose incident updates." },
  { q: "Do you offer refunds?", a: "Burns are final. Use test $STATIC on devnet to dry-run before mainnet." },
  { q: "Which wallets are supported?", a: "Phantom, Solflare, Backpack via wallet adapter. Recipient view will support any wallet that can read NFT metadata." },
  { q: "Which networks?", a: "Devnet for now with placeholder mint; mainnet after audit + SLAs." },
];

const BurnSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(
    burnOptions.findIndex((o) => o.value === value) || 0
  );
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
    const idx = burnOptions.findIndex((o) => o.value === val);
    onChange(val);
    setFocusIndex(idx >= 0 ? idx : 0);
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
        const opt = burnOptions[focusIndex] || burnOptions[0];
        handleSelect(opt.value);
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
        {value} <span className="select-caret" aria-hidden="true">v</span>
      </button>
      <div className="select-menu" role="listbox" aria-label="Burn level options">
        {burnOptions.map((opt, idx) => (
          <button
            type="button"
            key={opt.value}
            className={`select-option ${opt.value === value ? "active" : ""}`}
            data-focused={idx === focusIndex}
            onClick={() => handleSelect(opt.value)}
            onMouseEnter={() => setFocusIndex(idx)}
            >
            <div className="select-option-head">
              <span className="select-option-label">{opt.label}</span>
              <span className="select-option-value">${opt.value}</span>
            </div>
            <div className="select-option-desc">{opt.desc}</div>
            <div className="select-bars">
              <span />
              <span />
              <span />
              {opt.value !== "0.25" && <span />}
              {opt.value === "1.50" && <span />}
            </div>
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
  const [statusBadge, setStatusBadge] = useState("Ready");
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
  const faqItems = [
    {
      q: "Why a single relay?",
      a: "One hop means fewer breadcrumbs. Static uses a blinded relay with no routing table exposure, then proofs the burn on-chain.",
    },
    {
      q: "What burns on every send?",
      a: "Every payload destroys $STATIC. The burn cost can be tuned per message to signal urgency without leaking who sent it.",
    },
    {
      q: "How do recipients read?",
      a: "Recipients decrypt directly from the NFT envelope. The relay never touches plaintext, and messages self-destruct after confirmation.",
    },
    {
      q: "Is this live?",
      a: "The network is in dry run on devnet. Join the waitlist to get the first production endpoint and a pre-flight burn voucher.",
    },
    ...extraFaq,
  ];

  const handleSend = async (event) => {
    event.preventDefault();
    setSendError("");
    setSendStatus("");
    setSendPhase("preparing");
    setStatusBadge("Preparing");

    if (!connected || !walletAddr) {
      setSendError("Connect a wallet first.");
      setStatusBadge("Connect wallet");
      await handleConnect();
      setSendPhase("idle");
      return;
    }

    try {
      new PublicKey(recipient);
    } catch (err) {
      setSendError("Recipient address is invalid.");
      setStatusBadge("Invalid address");
      setSendPhase("idle");
      return;
    }

    if (!message.trim()) {
      setSendError("Add a message payload to send.");
      setStatusBadge("Add message");
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
      setStatusBadge("Confirming");
      addToast("Transmission prepared (stub). Wire program to send.", "success");
      setTimeout(() => {
        setTickerItems((prev) =>
          prev.map((item) =>
            item.sig === sig ? { ...item, status: "confirmed" } : item
          )
        );
        setSendStatus("Stub: confirmed.");
        setSendPhase("done");
        setStatusBadge("Confirmed");
        addToast("Transmission marked confirmed (stub).", "info");
        setTimeout(() => setSendPhase("idle"), 1200);
      }, 1400);
      // TODO: replace with real transaction build & send when program is ready.
    } catch (err) {
      setSendError(err?.message || "Send failed.");
      addToast("Send failed.", "error");
      setStatusBadge("Error");
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
            className={`nav-cta ${walletAddr ? "connected" : ""}`}
            onClick={walletAddr ? handleDisconnect : handleConnect}
            disabled={connecting}
          >
            {walletButtonLabel}
          </button>
        </header>

        <div className="announce-bar">
          <div className="announce-dot" />
          <span className="announce-text">
            Network: Devnet relay live | Audit in progress | Uptime target 99.9%
          </span>
          <a className="announce-link" href="#roadmap">
            View roadmap
          </a>
        </div>

        <main className="main">
          <section className="hero">
            <div className="hero-text" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Dark-web transmissions for Solana</p>
              <h1>Send Static on Solana.</h1>
              <p className="hero-subtitle">
                Mint encrypted NFT messages, route them through a blinded hop,
                and burn $STATIC on every transmission.
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
                <span>Minimized trace. Single relay. Public burns for proof.</span>
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
                  <span>Trace minimized via single hop</span>
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
            <div className="ticker-cards">
              {tickerItems.slice(-4).map((tx, idx) => (
                <div className="ticker-card" key={`${tx.to}-${tx.burn}-card-${idx}`}>
                  <div className="ticker-card-row">
                    <span className="dot" />
                    <span className="label">To</span>
                    <span className="val">{tx.to}</span>
                  </div>
                  <div className="ticker-card-row">
                    <span className="label">Burn</span>
                    <span className="val">${tx.burn}</span>
                    <span className={`status-chip-mini ${tx.status}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="cta-rail" aria-label="Key actions">
            <div className="cta-copy">
              <p className="eyebrow">Action</p>
              <h3>Prep your transmission.</h3>
              <p className="section-subtitle">
                Connect to stage a message, read the litepaper, or join the waitlist for production access.
              </p>
            </div>
            <div className="cta-actions">
              <button
                className="primary-btn glow"
                type="button"
                onClick={walletAddr ? undefined : handleConnect}
                disabled={connecting || !!walletAddr}
              >
                {walletAddr ? "Connected" : "Connect wallet"}
              </button>
              <a className="ghost-link" href={litepaperHref}>
                Read litepaper
              </a>
              <a className="ghost-link" href="#faq">
                Join waitlist
              </a>
            </div>
          </section>

          <section className="transmit" id="send">
            <div className="transmit-card" data-anim style={{ "--delay": "0.05s" }}>
              <div className="transmit-header">
                <p className="eyebrow">Send</p>
                <h2>Mint an encrypted NFT message</h2>
                <p className="section-subtitle">
                  Encrypt off-chain, pick a burn tier, and drop the payload via a blinded relay. Burns prove cost without
                  exposing the sender.
                </p>
              </div>
              <form className="transmit-form" onSubmit={handleSend}>
                <div className="form-row">
                  <label className="has-tip stacked-label">
                    <span className="label-main">Recipient wallet</span>
                    <span className="label-sub">Destination address for the NFT message.</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Recipient address (e.g. 9x...k3F)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="has-tip stacked-label">
                    <span className="label-main">Message payload</span>
                    <span className="label-sub">Content encrypts client-side before minting the NFT.</span>
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
                    <label className="has-tip stacked-label">
                      <span className="label-main">Burn level (USD)</span>
                      <span className="label-sub">Each send burns $STATIC at this USD value.</span>
                    </label>
                    <BurnSelect value={burnTier} onChange={setBurnTier} />
                  </div>
                  <div>
                    <label className="has-tip stacked-label">
                      <span className="label-main">Status</span>
                      <span className="label-sub">Live state of this transmission attempt.</span>
                    </label>
                    <div className={`status-chip ${statusBadge !== "Ready" ? "active" : ""}`}>
                      {sending ? "Preparing transaction..." : statusBadge || "Ready"}
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

          <section className="health" id="health">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Network</p>
              <h2>Live network health</h2>
              <p className="section-subtitle">
                Relay uptime, latency, and burns update continuously so you can gauge liveliness without exposing origin.
              </p>
            </div>
            <div className="health-grid">
              {healthStats.map((stat, idx) => (
                <article className={`health-card ${stat.tone}`} key={stat.label} data-anim style={{ "--delay": `${0.08 + idx * 0.05}s` }}>
                  <div className="health-label">{stat.label}</div>
                  <div className="health-value">{stat.value}</div>
                  <span className={`health-badge ${stat.tone}`}>{stat.tone === "good" ? "OK" : stat.tone === "warn" ? "Warn" : "Info"}</span>
                  <p className="health-desc">{stat.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="roadmap" id="roadmap">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Trust & roadmap</p>
              <h2>Path to mainnet</h2>
              <p className="section-subtitle">
                Track audit status, network stages, and what ships next. SLAs and monitoring land before production.
              </p>
            </div>
            <div className="roadmap-grid">
              {roadmap.map((item, idx) => (
                <article className="roadmap-card" key={item.title} data-anim style={{ "--delay": `${0.08 + idx * 0.05}s` }}>
                  <div className="roadmap-head">
                    <h3>{item.title}</h3>
                    <span className="pill">{item.status}</span>
                  </div>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="privacy" id="privacy">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Encryption & Privacy</p>
              <h2>Keep payloads off the grid</h2>
              <p className="section-subtitle">
                Payloads are encrypted client-side, relayed through a single blinded hop, and only a burn receipt is public.
              </p>
            </div>
            <div className="privacy-grid">
              <article className="privacy-card" data-anim style={{ "--delay": "0.08s" }}>
                <h3>Encrypt locally</h3>
                <p>ECDH-derived symmetric keys with AES-GCM; relay never sees plaintext.</p>
              </article>
              <article className="privacy-card" data-anim style={{ "--delay": "0.13s" }}>
                <h3>Single blinded hop</h3>
                <p>One relay, no breadcrumbs. No routing table exposure.</p>
              </article>
              <article className="privacy-card" data-anim style={{ "--delay": "0.18s" }}>
                <h3>Proof via burn</h3>
                <p>Only the burn receipt is on-chain; cost proves delivery, not identity.</p>
              </article>
            </div>
          </section>

          <section className="recipient" id="recipient">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Recipient experience</p>
              <h2>Reading the envelope</h2>
              <p className="section-subtitle">
                How a recipient opens an encrypted NFT payload without exposing the sender or path.
              </p>
            </div>
            <div className="recipient-grid">
              {recipientSteps.map((step, idx) => (
                <article className="recipient-card" key={step.title} data-anim style={{ "--delay": `${0.08 + idx * 0.05}s` }}>
                  <div className="pill muted">{`Step ${idx + 1}`}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="token" id="token">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Token & Burns</p>
              <h2>The $STATIC burn economy</h2>
              <p className="section-subtitle">
                Each message destroys $STATIC. Burn level tunes priority and telemetry without revealing who sent it.
              </p>
            </div>
            <div className="token-grid">
              <div className="token-card" data-anim style={{ "--delay": "0.08s" }}>
                <h3>Mint</h3>
                <p className="mono">STATIC_MINT_ADDRESS_HERE</p>
                <p>Replace with your SPL mint once live. Devnet uses a placeholder for staging.</p>
              </div>
              <div className="token-card" data-anim style={{ "--delay": "0.13s" }}>
                <h3>Burn policy</h3>
                <p>Every send burns $STATIC. Higher burns unlock priority lanes and telemetry.</p>
              </div>
              <div className="token-card" data-anim style={{ "--delay": "0.18s" }}>
                <h3>Receipts</h3>
                <p>Burn receipts are the public footprint; tie cost to velocity, not origin. Use relayers + burner ATAs to reduce linkage.</p>
              </div>
            </div>
          </section>

          <section className="devhooks" id="dev">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Developer hooks</p>
              <h2>Build with Static</h2>
              <p className="section-subtitle">
                Wire sends, burns, and events into your stack. Program IDs and examples are ready for dry runs.
              </p>
            </div>
            <div className="dev-grid">
              {devHooks.map((hook, idx) => (
                <article className="dev-card" key={hook.title} data-anim style={{ "--delay": `${0.08 + idx * 0.05}s` }}>
                  <div className="dev-head">
                    <span className="pill">{hook.badge}</span>
                    <h3>{hook.title}</h3>
                  </div>
                  <p>{hook.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="testimonials" id="use-cases">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Use cases</p>
              <h2>Trusted by stealth teams</h2>
              <p className="section-subtitle">
                Plausible scenarios from ops teams, responders, and vault comms that need encrypted relays with proof of cost.
              </p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((item, idx) => (
                <article className="testimonial-card" key={idx} data-anim style={{ "--delay": `${0.08 + idx * 0.05}s` }}>
                  <p className="quote">"{item.quote}"</p>
                  <p className="author">{item.author}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="checklist" id="checklist">
            <div className="section-header" data-anim style={{ "--delay": "0.05s" }}>
              <p className="eyebrow">Road to mainnet</p>
              <h2>Serious about production</h2>
              <p className="section-subtitle">
                Security, monitoring, and anti-abuse are part of the launch gate. Here's what ships before mainnet.
              </p>
            </div>
            <ul className="checklist-list">
              {checklist.map((item, idx) => (
                <li key={idx} data-anim style={{ "--delay": `${0.08 + idx * 0.04}s` }}>
                  <span className="check-ico" aria-hidden="true">*</span>
                  {item}
                </li>
              ))}
            </ul>
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
              {faqItems.map((item, idx) => (
                <article
                  className="faq-item"
                  data-anim
                  key={item.q}
                  style={{ "--delay": `${0.08 + idx * 0.04}s` }}
                >
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <footer className="footer">
            <div className="footer-brand">
              <div className="nav-logo">STATIC</div>
              <p>Encrypted relay for Solana. Burns prove delivery without exposing the sender.</p>
              <div className="footer-status">
                <span className="announce-dot" /> Devnet relay live | Audit in progress
              </div>
            </div>
            <div className="footer-links">
              <div>
                <h4>Docs</h4>
                <a href={litepaperHref}>Litepaper</a>
                <a href="#dev">Developer hooks</a>
                <a href="#privacy">Privacy</a>
              </div>
              <div>
                <h4>Company</h4>
                <a href="#roadmap">Roadmap</a>
                <a href="#faq">FAQ</a>
                <a href="#pricing">Burn tiers</a>
              </div>
              <div>
                <h4>Status</h4>
                <a href="#health">Network health</a>
                <a href="#how">How it works</a>
                <a href="#send">Send</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
