import { useState, useEffect, useRef } from "react";
import {
  Shield, Search, RefreshCw, ExternalLink, Users, Target,
  Clock, Vote, Zap, Lock, Globe, CheckCircle, XCircle,
  TrendingUp, Wallet, ArrowRight, Code2, ShieldCheck,
  BadgeCheck, Network
} from "lucide-react";
import { ethers } from "ethers";



// ── CONTRACT CONFIG ──────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x2d3D8f0e3cad89773205e4Ea4783f129266D17a1";

const ABI = [
  { "inputs": [], "name": "totalCampaigns", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "uint256", "name": "_goalInEther", "type": "uint256" }, { "internalType": "uint256", "name": "_daysToRaise", "type": "uint256" }], "name": "createCampaign", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "uint256", "name": "_amountInEther", "type": "uint256" }], "name": "addMilestone", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }, { "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }, { "internalType": "bool", "name": "_approve", "type": "bool" }], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "claimRefund", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "getCampaign", "outputs": [{ "components": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address payable", "name": "creator", "type": "address" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "goalAmount", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint256", "name": "totalRaised", "type": "uint256" }, { "internalType": "bool", "name": "goalReached", "type": "bool" }, { "internalType": "bool", "name": "isCancelled", "type": "bool" }], "internalType": "struct CrowdFund.Campaign", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }, { "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }], "name": "getMilestone", "outputs": [{ "components": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "releaseAmount", "type": "uint256" }, { "internalType": "bool", "name": "isApproved", "type": "bool" }, { "internalType": "bool", "name": "isRejected", "type": "bool" }, { "internalType": "uint256", "name": "approveVotes", "type": "uint256" }, { "internalType": "uint256", "name": "rejectVotes", "type": "uint256" }], "internalType": "struct CrowdFund.Milestone", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "getMyDonation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "getDonorCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }], "name": "getTimeRemaining", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "milestoneCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "hasVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

/* ── GLOBAL STYLES ─────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      background: #F7F7F5;
      color: #111;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    button { font-family: inherit; cursor: pointer; }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  `}</style>
);

// ____________PHOTO SLIDESHOW__________________
function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const slides = [
    "/img1.jpg",
    "/img2.jpg",    
    "/img3.jpg",
    "/img6.jpg"
  ];

  const totalSlides = slides.length;

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "absolute",
      right: "2rem",
      top: "50%",
      transform: "translateY(-55%)",
      width: "800px",
      maxWidth: "40vw",
     aspectRatio: "16 / 10",
      borderRadius: 12
    }}>
      
      {/* Slider */}
      <div style={{
        overflow: "hidden",
        borderRadius: 12,
        border: "2px solid #111",
        height: "100%" 
      }}>
        <div
          ref={sliderRef}
          style={{
            display: "flex",
            transition: "transform 0.5s ease-in-out",
            transform: `translateX(-${currentSlide * 100}%)`
          }}
        >
          {slides.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Slide ${i}`}
              style={{
                width: "100%",
                height: "100%",        
                objectFit: "cover", 
                flexShrink: 0,
                display: "block"
              }}
            />
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 10,
        gap: 6
      }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentSlide(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === currentSlide ? "#111" : "#ccc",
              cursor: "pointer"
            }}
          />
        ))}
      </div>

    </div>
  );
}

/* ── FADE-UP HOOK ───────────────────────────────────────────────── */
function useFadeUp() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeUp({ children, delay = 0, style = {}, className = "" }) {
  const [ref, vis] = useFadeUp();
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(20px)",
      transition: `opacity .55s ease ${delay}s, transform .55s ease ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}



/* ── NAV ────────────────────────────────────────────────────────── */
function Nav({showToast}) {
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
const connectWallet = async () => {
  if (!window.ethereum) { showToast("Please install MetaMask"); return; }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer   = await provider.getSigner();
    const _account = await signer.getAddress();
    const _contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setAccount(_account);
    setContract(_contract);
    // Make contract available globally so other components can use it
    window._verifundContract = _contract;
    window._verifundAccount  = _account;
    window.dispatchEvent(new Event("walletConnected"));
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      height: 60,
      background: scrolled ? "rgba(247,247,245,0.97)" : "#F7F7F5",
      borderBottom: scrolled ? "2px solid #111" : "2px solid transparent",
      transition: "border-color .2s",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem",
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6, background: "#111",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <ShieldCheck size={16} color="#F7F7F5" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "#111", letterSpacing: "-0.5px" }}>
          Veri<span style={{ color: "#2563EB" }}>Fund</span>
        </span>
      </a>

      <div style={{ display: "flex", gap: 4 }}>
        {[["Campaigns","campaigns"],["How It Works","how"],["Dashboard","dashboard"]].map(([l,id]) => (
          <button key={id} onClick={() => scrollTo(id)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none",
            background: "transparent", fontSize: 14, fontWeight: 500,
            color: "#555", transition: "all .15s",
          }}
          onMouseEnter={e => { e.target.style.background = "#E8E8E4"; e.target.style.color = "#111"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#555"; }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 4,
          background: "transparent", border: "1.5px solid #111",
          fontSize: 12, fontWeight: 600, color: "#111",
          fontFamily: "'Space Mono', monospace",
        }}>Beta · Sepolia</span>
        {/* <button style={{
          padding: "8px 18px", borderRadius: 6,
          background: "#111", color: "#F7F7F5",
          border: "none", fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
          transition: "background .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#2563EB"}
        onMouseLeave={e => e.currentTarget.style.background = "#111"}>
          <Wallet size={14} /> Connect Wallet
        </button> */}
        <button onClick={connectWallet} style={{
          padding: "8px 18px", borderRadius: 6,
          background: "#111", color: "#F7F7F5",
          border: "none", fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
          transition: "background .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#2563EB"}
        onMouseLeave={e => e.currentTarget.style.background = "#111"}>
  <Wallet size={14} />
  {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
</button>
      </div>
    </nav>
  );
}

/* ── TICKER ─────────────────────────────────────────────────────── */
const TICKS = [
  "Smart Contract Escrow", "On-Chain Donor Voting", "100% Refund Guaranteed",
  "Public on Etherscan", "Zero Intermediaries", "Built on Ethereum",
  "Smart Contract Escrow", "On-Chain Donor Voting", "100% Refund Guaranteed",
  "Public on Etherscan", "Zero Intermediaries", "Built on Ethereum",
];
function Ticker() {
  return (
    <div style={{ background: "#111", overflow: "hidden", padding: "10px 0" }}>
      <div style={{ display: "flex", animation: "marquee 35s linear infinite", width: "max-content", whiteSpace: "nowrap" }}>
        {TICKS.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 32px", fontSize: 12, color: "#666", fontWeight: 500 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563EB", flexShrink: 0, display: "inline-block" }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── HERO ────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      background: "#F7F7F5",
      minHeight: "calc(100vh - 60px)",
      display: "flex", alignItems: "center",
      padding: "5rem 2rem",
      position: "relative",
    }}>
      <Slider />

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 12px", borderRadius: 4,
          border: "1.5px solid #111", marginBottom: "1.5rem",
          fontSize: 12, fontWeight: 600, color: "#111",
          fontFamily: "'Space Mono', monospace",
          animation: "fadeUp .5s ease both",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", animation: "pulse 2s infinite" }} />
          Ethereum · Zero Intermediaries · Open Source
        </div>

        <h1 style={{
          fontSize: "clamp(3rem,7vw,5.5rem)",
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-2px",
          color: "#111",
          marginBottom: "1.5rem",
          maxWidth: 800,
          animation: "fadeUp .5s ease .07s both",
        }}>
          Crowdfunding<br />
          without<br />
          <span style={{ color: "#2563EB" }}>blind trust.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1rem,1.6vw,1.2rem)",
          color: "#555",
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: "2.5rem",
          fontWeight: 400,
          animation: "fadeUp .5s ease .14s both",
        }}>
          Every donation is locked in an audited smart contract.
          Funds only release when donors vote to approve.
          Goal not met? You get a full refund. Automatically.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "3rem", animation: "fadeUp .5s ease .2s both" }}>
          <button
            onClick={() => scrollTo("campaigns")}
            style={{
              padding: "14px 28px", borderRadius: 8,
              background: "#111", color: "#F7F7F5",
              border: "2px solid #111", fontSize: 15, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.borderColor = "#2563EB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#111"; }}
          >
            Start a Campaign <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollTo("how")}
            style={{
              padding: "14px 28px", borderRadius: 8,
              background: "transparent", color: "#111",
              border: "2px solid #111", fontSize: 15, fontWeight: 600,
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#F7F7F5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111"; }}
          >
            How It Works
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", animation: "fadeUp .5s ease .27s both" }}>
          {[
            [<Lock size={13} />, "Smart Contract Secured"],
            [<Search size={13} />, "Fully Transparent"],
            [<RefreshCw size={13} />, "Automatic Refunds"],
          ].map(([icon, label]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px", borderRadius: 6,
              border: "1.5px solid #D4D4CE",
              background: "white",
              fontSize: 13, fontWeight: 500, color: "#333",
            }}>
              <span style={{ color: "#2563EB" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PROBLEM / SOLUTION ─────────────────────────────────────────── */
const PROBLEMS = [
  "Funds handed directly to creators with zero control",
  "No accountability — creators can miss milestones and keep money",
  "Refunds take months, often never arrive",
  "You have no visibility on where your money goes",
];
const SOLUTIONS = [
  "Funds locked in smart contract escrow, not the creator's wallet",
  "Every fund release requires a donor vote — majority rules, on-chain",
  "Goal not met? 100% automatic refund, no forms, no waiting",
  "Every transaction is public on Etherscan — forever",
];

function ProblemSolution() {
  return (
    <section style={{ background: "white", padding: "6rem 2rem", borderTop: "2px solid #111", borderBottom: "2px solid #111" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            The Problem
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: "-1px", color: "#111", marginBottom: "3rem", lineHeight: 1.15 }}>
            Traditional crowdfunding is broken.
          </h2>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          <FadeUp delay={0.08} style={{ background: "#FFF5F5", border: "2px solid #111", borderRight: "1px solid #111", padding: "2.5rem", borderRadius: "8px 0 0 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
              <XCircle size={18} color="#DC2626" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>Without VeriFund</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: "1.5rem", letterSpacing: "-0.3px" }}>
              Donate and hope for the best
            </p>
            {PROBLEMS.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: "1rem", alignItems: "flex-start" }}>
                <XCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>{p}</p>
              </div>
            ))}
          </FadeUp>

          <FadeUp delay={0.14} style={{ background: "#F0F6FF", border: "2px solid #111", borderLeft: "1px solid #111", padding: "2.5rem", borderRadius: "0 8px 8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
              <CheckCircle size={18} color="#2563EB" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2563EB" }}>With VeriFund</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: "1.5rem", letterSpacing: "-0.3px" }}>
              Proof before every rupee moves
            </p>
            {SOLUTIONS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: "1rem", alignItems: "flex-start" }}>
                <CheckCircle size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>{s}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ────────────────────────────────────────────────── */
const HOW = [
  { n: "01", icon: <Zap size={20} />, title: "Campaign Created", desc: "Creator sets a goal in ETH and a deadline. Deployed on-chain in one transaction." },
  { n: "02", icon: <Wallet size={20} />, title: "Donors Contribute", desc: "ETH flows directly into the smart contract escrow — fully trackable on Etherscan." },
  { n: "03", icon: <Target size={20} />, title: "Goal Reached", desc: "Campaign marked complete on-chain. Creator is notified. Voting can begin." },
  { n: "04", icon: <Vote size={20} />, title: "Vote on Milestones", desc: "Creator submits a milestone. Every donor votes. 50%+ majority decides the release." },
  { n: "05", icon: <CheckCircle size={20} />, title: "Automatic Settlement", desc: "Approved: funds released. Rejected or expired: full refunds. Zero human intervention." },
];

function HowItWorks() {
  return (
    <section id="how" style={{ background: "#F7F7F5", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            How It Works
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: "-1px", color: "#111", marginBottom: "3.5rem", lineHeight: 1.15 }}>
            Five steps. Code handles the rest.
          </h2>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {HOW.map((s, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr",
                gap: "0 2rem", alignItems: "center",
                padding: "1.75rem 2rem",
                background: "white",
                borderTop: i === 0 ? "2px solid #111" : "1px solid #D4D4CE",
                borderLeft: "2px solid #111", borderRight: "2px solid #111",
                borderBottom: i === HOW.length - 1 ? "2px solid #111" : "none",
                borderRadius: i === 0 ? "8px 8px 0 0" : i === HOW.length - 1 ? "0 0 8px 8px" : 0,
                transition: "background .15s",
                cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#F0F6FF"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#2563EB" }}>{s.n}</span>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#F0F6FF", border: "1.5px solid #D4DEFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                    {s.icon}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────────────── */
function CampaignsSection({showToast}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [myDonations, setMyDonations] = useState({});

  const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const primaryBtn = {
  flex: 1,
  padding: "10px",
  background: "#111",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 700
};

const secondaryBtn = {
  flex: 1,
  padding: "10px",
  background: "#eee",
  border: "none",
  borderRadius: 8
};
  
  useEffect(() => {
  const handleLoad = () => {
    if (window._verifundContract) {
      load();
    }
  };

  // run once (in case already connected)
  handleLoad();

  // run after wallet connects
  window.addEventListener("walletConnected", handleLoad);

  return () => {
    window.removeEventListener("walletConnected", handleLoad);
  };
}, []);


useEffect(() => {
  const setupListeners = () => {
    const c = window._verifundContract;
    if (!c) return;

    console.log("Listening to contract events...");

    const handleCampaignCreated = (...args) => {
      console.log("CampaignCreated event:", args);
      load();
    };

    const handleDonation = (...args) => {
      console.log("DonationReceived event:", args);
      load();
    };

    c.on("CampaignCreated", handleCampaignCreated);
    c.on("DonationReceived", handleDonation);

    return () => {
      c.off("CampaignCreated", handleCampaignCreated);
      c.off("DonationReceived", handleDonation);
    };
  };

  // run if already connected
  setupListeners();

  // run after wallet connects
  window.addEventListener("walletConnected", setupListeners);

  return () => {
    window.removeEventListener("walletConnected", setupListeners);
  };
}, []);

  const fmt = (wei) => {
    if (!wei) return "0";
    const e = Number(BigInt(wei)) / 1e18;
    return e < 0.001 ? e.toFixed(6) : e.toFixed(4);
  };
  const pct = (r, g) => {
    if (!g || BigInt(g) === 0n) return 0;
    return Math.min(100, Math.round((Number(BigInt(r)) / Number(BigInt(g))) * 100));
  };
  const timeLeft = (s) => {
    const n = Number(s);
    if (n <= 0) return "Ended";
    const d = Math.floor(n / 86400), h = Math.floor((n % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((n % 3600) / 60)}m left`;
  };

  const load = async () => {
    const c = window._verifundContract;
    const account = window._verifundAccount;
    if (!c) { showToast("Connect your wallet first!"); return; }
    setLoading(true);
    try {
      const total = await c.totalCampaigns();
      const list  = [];
      for (let i = 0; i < Number(total); i++) {
        const camp    = await c.getCampaign(i);
        const donors  = await c.getDonorCount(i);
        const timeRem = await c.getTimeRemaining(i);
        const myDonation = await c.getMyDonation(i);
        list.push({
          id: i,
          title: camp.title,
          description: camp.description,
          creator: camp.creator,
          goalAmount: camp.goalAmount,
          totalRaised: camp.totalRaised,
          goalReached: camp.goalReached,
          donorCount: Number(donors),
          timeRemaining: timeRem,
          myDonation: myDonation
        });
      }
      setCampaigns(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const donate = async (id) => {
  if (!donationAmount || isNaN(donationAmount)) {
    showToast("Enter valid amount");
    return;
  }

  try {
    const c = window._verifundContract;
    const tx = await c.donate(id, {
      value: ethers.parseEther(donationAmount)
    });

    await tx.wait();
    showToast("Donation successful ❤️");

    setDonationAmount(""); // reset
    setSelectedCampaign(null); // close modal
  } catch (e) {
    showToast("Error: " + (e.reason || e.message));
  }
};

const handleCreate = async () => {
  const c = window._verifundContract;

  if (!c) {
    showToast("Connect wallet first");
    return;
  }

  try {
    const tx = await c.createCampaign(
      title,
      description,
      ethers.parseEther(goal),
      duration
    );

    await tx.wait();

    showToast("Campaign created 🎉");

    setShowCreate(false);

    // refresh campaigns automatically
    load();

  } catch (e) {
    alert(e.reason || e.message);
  }
};

const claimRefund = async (id) => {
  try {
    const c = window._verifundContract;

    const tx = await c.claimRefund(id);
    await tx.wait();

    showToast("Refund claimed 💸");
    load(); // refresh UI
  } catch (e) {
    showToast("Error: " + (e.reason || e.message), "error");
  }
};

const canDonate = selectedCampaign &&
  Number(selectedCampaign.timeRemaining) > 0 &&
  !selectedCampaign.goalReached;

const canRefund = selectedCampaign &&
  Number(selectedCampaign.timeRemaining) <= 0 &&
  !selectedCampaign.goalReached &&
  Number(selectedCampaign.myDonation) > 0;
  return (
    <div id="campaigns" style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <button
  onClick={() => setShowCreate(true)}
  style={{
    padding: "10px 20px",
    borderRadius: 8,
    background: "#2563EB",
    color: "white",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  }}
>
  + Create Campaign
</button>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Live Campaigns</h2>
        <button onClick={load} disabled={loading} style={{
          padding: "10px 20px", borderRadius: 8, background: "#111", color: "white",
          border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14
        }}>
          {loading ? "Loading..." : "🔄 Load from Blockchain"}
        </button>
        
      </div>

      {campaigns.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888", border: "2px dashed #ddd", borderRadius: 12 }}>
          Connect your wallet and click "Load from Blockchain" to see real campaigns.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {campaigns.map((c) => {
          const p      = pct(c.totalRaised, c.goalAmount);
          const status = c.goalReached ? "Goal Reached 🎯" : (Number(c.timeRemaining) > 0 ? "Active 🟢" : "Ended");
          return (
            <div key={c.id}  onClick={() => setSelectedCampaign(c)} style={{
              background: "white", borderRadius: 12, border: "2px solid #111",
              overflow: "hidden", boxShadow: "3px 3px 0 #111"
            }}>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>
                  {status} · Campaign #{c.id}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.6,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>{c.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>{fmt(c.totalRaised)} ETH raised</span>
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>{p}%</span>
                </div>
                <div style={{ height: 6, background: "#F0F0F0", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${p}%`, background: c.goalReached ? "#2563EB" : "#111", borderRadius: 3, transition: "width 1s" }}></div>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
                  Goal: {fmt(c.goalAmount)} ETH · 👥 {c.donorCount} donors · ⏱ {timeLeft(c.timeRemaining)}
                </div>
                <div style={{ marginBottom: 16 }}>

                </div>
                {Number(c.timeRemaining) > 0 && !c.goalReached && Number(c.myDonation) > 0 && (
                  <button onClick={() => donate(c.id)} style={{
                    width: "100%", padding: "10px", borderRadius: 8,
                    background: "#111", color: "white", border: "none",
                    fontWeight: 700, cursor: "pointer", fontSize: 14
                  }}>
                    Donate ETH
                  </button>
                )}
                {Number(c.timeRemaining) <= 0 && !c.goalReached && (
  <button
    onClick={() => claimRefund(c.id)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: 8,
      background: "#DC2626",
      color: "white",
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 14
    }}
  >
    Claim Refund
  </button>
)}
              </div>
            </div>
          );
        })}
      {selectedCampaign && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200
  }}>
    <div style={{
      background: "white",
      borderRadius: 16,
      width: "600px",
      maxWidth: "92%",
      border: "2px solid #111",
      boxShadow: "6px 6px 0 #111",
      overflow: "hidden",
      animation: "fadeUp 0.3s ease"
    }}>

      {/* HEADER */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 700 }}>
          Campaign #{selectedCampaign.id}
        </div>

        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          marginTop: 6
        }}>
          {selectedCampaign.title}
        </h2>

        <p style={{
          fontSize: 14,
          color: "#555",
          marginTop: 8,
          lineHeight: 1.6
        }}>
          {selectedCampaign.description}
        </p>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: "1.5rem" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 6
        }}>
          <span style={{ fontWeight: 600 }}>
            {fmt(selectedCampaign.totalRaised)} ETH raised
          </span>
          <span style={{ color: "#2563EB", fontWeight: 700 }}>
            {Math.round(
              (Number(selectedCampaign.totalRaised) /
                Number(selectedCampaign.goalAmount)) * 100
            )}%
          </span>
        </div>

        <div style={{
          height: 8,
          background: "#eee",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 16
        }}>
          <div style={{
            width: `${Math.min(100,
              (Number(selectedCampaign.totalRaised) /
               Number(selectedCampaign.goalAmount)) * 100
            )}%`,
            height: "100%",
            background: "#111",
            transition: "width 0.4s"
          }} />
        </div>

        {/* STATS */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#555",
          marginBottom: 20
        }}>
          <span>Goal: {fmt(selectedCampaign.goalAmount)} ETH</span>
          <span>👥 {selectedCampaign.donorCount} donors</span>
        </div>
          <label style={{
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    display: "block"
  }}>
    Enter amount (ETH)
  </label>

  <input
    type="number"
    placeholder="0.01"
    value={donationAmount}
    onChange={(e) => setDonationAmount(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      margin: "8px",
      borderRadius: 8,
      border: "1.5px solid #ccc",
      fontSize: 14
    }}
  />
  
        {/* ACTIONS */}
        
        {/* ACTIONS */}
<div style={{ display: "flex", gap: 10 }}>
  {canDonate && (
    <button
      onClick={() => donate(selectedCampaign.id)}
      style={{
        flex: 1, padding: "12px", background: "#111",
        color: "white", border: "none", borderRadius: 8,
        fontWeight: 700, fontSize: 14, cursor: "pointer",
        transition: "all 0.2s"
      }}
      onMouseEnter={e => e.target.style.background = "#2563EB"}
      onMouseLeave={e => e.target.style.background = "#111"}
    >
      Donate ETH
    </button>
  )}

  {canRefund && (
    <button
      onClick={() => claimRefund(selectedCampaign.id)}
      style={{
        flex: 1, padding: "12px", background: "#DC2626",
        color: "white", border: "none", borderRadius: 8,
        fontWeight: 700, fontSize: 14, cursor: "pointer",
      }}
      onMouseEnter={e => e.target.style.background = "#B91C1C"}
      onMouseLeave={e => e.target.style.background = "#DC2626"}
    >
      Claim Refund
    </button>
  )}

  <button
    onClick={() => setSelectedCampaign(null)}
    style={{
      padding: "12px 16px", background: "#eee",
      border: "none", borderRadius: 8,
      fontWeight: 600, cursor: "pointer"
    }}
  >
    Close
  </button>
</div>
          {/* <button
            onClick={() => donate(selectedCampaign.id)}
            style={{
              flex: 1,
              padding: "12px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.target.style.background = "#2563EB"}
            onMouseLeave={e => e.target.style.background = "#111"}
          >
            Donate ETH
          </button>

          <button
            onClick={() => setSelectedCampaign(null)}
            style={{
              padding: "12px 16px",
              background: "#eee",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close
          </button> */}
        {/* </div> */}
      </div>

    </div>
  </div>
)}

{showCreate && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300
  }}>
    <div style={{
      background: "white",
      borderRadius: 16,
      width: "500px",
      maxWidth: "92%",
      border: "2px solid #111",
      boxShadow: "6px 6px 0 #111",
      padding: "1.5rem"
    }}>

      <h2 style={{ fontSize: 20, fontWeight: 700 }}>
        Create Campaign
      </h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...inputStyle, height: 80 }}
      />

      <input
        type="number"
        placeholder="Goal (ETH)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={inputStyle}
      />

      <input
        type="number"
        placeholder="Duration (seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={handleCreate} style={primaryBtn}>
          Create
        </button>

        <button onClick={() => setShowCreate(false)} style={secondaryBtn}>
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
  totalEth: 0,
  totalDonors: 0
    });

  const loadStats = async () => {
  const c = window._verifundContract;
  if (!c) return;

  try {
    const total = await c.totalCampaigns();

    let totalEth = 0;
    let totalDonors = 0;

    for (let i = 0; i < Number(total); i++) {
      const camp = await c.getCampaign(i);
      const donors = await c.getDonorCount(i);

      totalEth += Number(camp.totalRaised) / 1e18;
      totalDonors += Number(donors);
    }

    setStats({
      totalEth: totalEth.toFixed(2),
      totalDonors
    });

  } catch (e) {
    console.error(e);
  }
};
useEffect(() => {
  const handler = () => loadStats();

  window.addEventListener("walletConnected", handler);

  return () => window.removeEventListener("walletConnected", handler);
}, []);
  return (
    <section id="dashboard" style={{ background: "white", padding: "6rem 2rem", borderTop: "2px solid #111" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Transparency Dashboard
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 700, letterSpacing: "-1px", color: "#111", lineHeight: 1.15 }}>
              Live campaign data
            </h2>
          </FadeUp>
          <FadeUp>
            <button
              onClick={() => window.open("https://sepolia.etherscan.io/address/0x2d3D8f0e3cad89773205e4Ea4783f129266D17a1", "_blank")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 6,
                border: "2px solid #111", background: "transparent",
                fontSize: 13, fontWeight: 600, color: "#111",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#F7F7F5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111"; }}
            >
              <ExternalLink size={14} /> View on Etherscan
            </button>
          </FadeUp>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          {/* <div id="campaigns" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FadeUp delay={0.05}><CampaignCard title="Clean Water Access — Rural Rajasthan" raised="1.42" pct={71} status="Active" statusColor="#059669" statusBg="#ECFDF5" barColor="#059669"
              meta={[{ icon: <Users size={12} />, val: "34 donors" }, { icon: <Target size={12} />, val: "2 ETH goal" }, { icon: <Clock size={12} />, val: "12d left" }]} /></FadeUp>
            <FadeUp delay={0.1}><CampaignCard title="Medical Aid for Flood Victims — Punjab" raised="5.00" pct={100} status="Voting Open" statusColor="#D97706" statusBg="#FFFBEB" barColor="#2563EB"
              meta={[{ icon: <Users size={12} />, val: "128 donors" }, { icon: <Vote size={12} />, val: "Milestone 1 voting" }, { icon: <CheckCircle size={12} />, val: "64% approve" }]} /></FadeUp>
            <FadeUp delay={0.15}><CampaignCard title="Open Source Dev Tools for Indian Startups" raised="3.20" pct={106} status="Funded" statusColor="#2563EB" statusBg="#EFF6FF" barColor="#2563EB"
              meta={[{ icon: <Users size={12} />, val: "89 donors" }, { icon: <CheckCircle size={12} />, val: "2 milestones approved" }, { icon: <TrendingUp size={12} />, val: "2 ETH released" }]} /></FadeUp>
          </div> */}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
  { val: stats.totalEth, label: "ETH in escrow" },
  { val: stats.totalDonors, label: "Verified donors" },
            ].map(s => (
              <FadeUp key={s.label}>
                <div style={{ background: "#F7F7F5", border: "2px solid #E8E8E4", borderRadius: 8, padding: "1.5rem" }}>
                  <p style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-2px", color: "#111", lineHeight: 1, marginBottom: 4, fontFamily: "'Space Mono',monospace" }}>{s.val}</p>
                  <p style={{ fontSize: 13, color: "#777", fontWeight: 500 }}>{s.label}</p>
                </div>
              </FadeUp>
            ))}

            <FadeUp>
              <div style={{ background: "#F0F6FF", border: "2px solid #D4DEFF", borderRadius: 8, padding: "1.5rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "1rem" }}>Active Voting</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>Medical Aid · Milestone 1</p>
                {[{ label: "Approve", pct: 64, color: "#059669" }, { label: "Reject", pct: 36, color: "#DC2626" }].map(v => (
                  <div key={v.label} style={{ marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#555", fontWeight: 500 }}>{v.label}</span>
                      <span style={{ fontWeight: 700, color: v.color }}>{v.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.7)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${v.pct}%`, height: "100%", background: v.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
      
    </section>
  );
}

/* ── TRUST FEATURES ─────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Lock size={20} />, title: "Escrow Smart Contract", desc: "All ETH flows into an immutable smart contract — not a company account or creator wallet. The code is the custodian." },
  { icon: <Vote size={20} />, title: "On-Chain Donor Voting", desc: "Every donor gets a vote proportional to their contribution. Results are immutably recorded — no one can alter or suppress them." },
  { icon: <RefreshCw size={20} />, title: "Guaranteed Refunds", desc: "If the goal isn't met by the deadline, donors claim a 100% refund directly from the contract. No human approval needed." },
  { icon: <Search size={20} />, title: "Full Transparency", desc: "Every donation, vote, and release is a public blockchain transaction. Anyone can audit any campaign at any time." },
  { icon: <Globe size={20} />, title: "Borderless Access", desc: "No bank account, no KYC delays, no restrictions. Any wallet anywhere can donate or create a campaign in under 60 seconds." },
  { icon: <ShieldCheck size={20} />, title: "Milestone Roadmap", desc: "Creators define milestones before funds are released. Donors know exactly what each disbursement covers before voting." },
];

function TrustFeatures() {
  return (
    <section style={{ background: "#F7F7F5", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Platform Features
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: "-1px", color: "#111", marginBottom: "3rem", lineHeight: 1.15 }}>
            Built for trust. Designed for clarity.
          </h2>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "#D4D4CE", border: "2px solid #D4D4CE", borderRadius: 8, overflow: "hidden" }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div style={{
                background: "white", padding: "2rem",
                transition: "background .15s", cursor: "default", height: "100%",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#F0F6FF"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "#F0F6FF", border: "1.5px solid #D4DEFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", marginBottom: "1rem" }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAILURE MODES ──────────────────────────────────────────────── */
const SCENARIOS = [
  { icon: <Target size={16} />, title: "Campaign doesn't hit its goal", desc: "Deadline passes without reaching the target — every donor's ETH is automatically available to withdraw. Full amount, no cuts." },
  { icon: <Vote size={16} />, title: "Donors reject a milestone", desc: "Majority votes reject → release blocked permanently. Creator must submit a new, better-justified milestone to try again." },
  { icon: <Lock size={16} />, title: "Creator abandons the campaign", desc: "If milestones are never submitted and voting expires, donors trigger a cancellation and receive proportional refunds." },
  { icon: <Shield size={16} />, title: "VeriFund shuts down", desc: "The contract lives on Ethereum — independent of this platform. You can still interact with your campaign directly via Etherscan." },
];

function FailureModes() {
  return (
    <section style={{ background: "#111", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "#2563EB", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Failure Modes
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: "-1px", color: "white", marginBottom: "0.75rem", lineHeight: 1.15 }}>
            What if things go wrong?
          </h2>
          <p style={{ fontSize: 15, color: "#666", marginBottom: "3rem", maxWidth: 520, lineHeight: 1.65 }}>
            VeriFund was designed assuming things will go wrong. The contract handles every failure — automatically.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#222", border: "2px solid #222", borderRadius: 8, overflow: "hidden" }}>
          {SCENARIOS.map((s, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div style={{
                background: "#171717", padding: "2rem",
                transition: "background .15s", cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1D2535"}
              onMouseLeave={e => e.currentTarget.style.background = "#171717"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60A5FA", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{s.title}</p>
                </div>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, paddingLeft: 44 }}>{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2} style={{ marginTop: "2rem" }}>
          <div style={{ background: "#171717", border: "2px solid #222", borderRadius: 8, padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem 3rem", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>The Iron Guarantee</p>
              {[
                "No one can steal your funds — not the creator, not VeriFund.",
                "Refunds are math, not promises. The condition is met, it executes.",
                "The code is public. Anyone can read and verify it.",
                "Ethereum is the arbiter. No company overrides a blockchain transaction.",
              ].map((g, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: "0.875rem" }}>
                  <CheckCircle size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>{g}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#0D0D0D", borderRadius: 6, padding: "1.25rem", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#4ADE80", lineHeight: 1.8, border: "1px solid #1A1A1A" }}>
              <span style={{ color: "#555" }}>{"// Refund logic — immutable"}</span><br />
              {"if (block.timestamp > deadline &&"}<br />
              {"    !goalReached) {"}<br />
              {"    donor.transfer(myDonation);"}<br />
              <span style={{ color: "#555" }}>{"// No human needed. Ever."}</span><br />
              {"}"}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ background: "#2563EB", padding: "6rem 2rem", textAlign: "center" }}>
      <FadeUp style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Live on Ethereum Sepolia
        </p>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, letterSpacing: "-1.5px", color: "white", marginBottom: "1rem", lineHeight: 1.1 }}>
          Give with certainty.<br />Fund with proof.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.70)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Every action counts, every decision is transparent, every promise is kept by code — not people.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <button style={{
            padding: "14px 28px", borderRadius: 8,
            background: "white", color: "#2563EB",
            border: "2px solid white", fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8,
            transition: "all .15s", cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
            Launch a Campaign <ArrowRight size={16} />
          </button>
          <button style={{
            padding: "14px 28px", borderRadius: 8,
            background: "transparent", color: "white",
            border: "2px solid rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
            transition: "all .15s", cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}>
            Read the Docs <ExternalLink size={14} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {[
            [<ShieldCheck size={13} />, "Smart contract audited"],
            [<Code2 size={13} />, "Open source"],
            [<Lock size={13} />, "Non-custodial"],
            [<BadgeCheck size={13} />, "Verified on Etherscan"],
          ].map(([icon, label], i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>
              {icon} {label}
            </span>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────── */
function Footer() {
  const cols = {
    Platform: [["Explore Campaigns","campaigns"],["Create Campaign",null],["How It Works","how"],["Dashboard","dashboard"]],
    Developers: [["Documentation ↗",null],["GitHub ↗",null],["View Contract ↗",null],["Verify Source ↗",null]],
    Community: [["About VeriFund",null],["For Donors",null],["For Creators",null],["Security",null]],
  };
  return (
    <footer style={{ background: "#0A0A0A", padding: "4rem 2rem 2rem", borderTop: "2px solid #1A1A1A" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={13} color="white" />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: "white" }}>VeriFund</span>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, maxWidth: 220, marginBottom: "1.25rem" }}>
              Trustless crowdfunding on Ethereum. Every donation protected. Every refund guaranteed.
            </p>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#4ADE80", background: "rgba(74,222,128,0.05)", padding: "5px 10px", borderRadius: 4, border: "1px solid rgba(74,222,128,0.12)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80" }} />
              0x2d3D8f0e…D17a1 · Sepolia
            </span>
          </div>
          {Object.entries(cols).map(([col, items]) => (
            <div key={col}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "#333", textTransform: "uppercase", marginBottom: "1rem" }}>{col}</p>
              {items.map(([label, id]) => (
                <button key={label} onClick={() => id && scrollTo(id)}
                  style={{ display: "block", fontSize: 13, color: "#555", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "3px 0", marginBottom: 4, textAlign: "left", transition: "color .15s" }}
                  onMouseEnter={e => e.target.style.color = "#60A5FA"}
                  onMouseLeave={e => e.target.style.color = "#555"}>
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1A1A1A", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#333" }}>© 2025 VeriFund · Built on Ethereum · Zero Trust Required</span>
          <span style={{ fontSize: 11, color: "#222", fontFamily: "'Space Mono',monospace" }}>contract · verified · open-source</span>
        </div>
      </div>
    </footer>
  );
}

/* ── APP ─────────────────────────────────────────────────────────── */
export default function App() {
  // ------TOAST NOTIFICATIONS--------------
const [toast, setToast] = useState(null);
const showToast = (message, type = "success") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3000);
};

  return (
    <>
    <GlobalStyles />

    {/* ✅ Toast lives here, in the render tree */}
    {toast && (
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: 10,
        fontWeight: 600,
        background: toast.type === "error" ? "#fee2e2" : "#ecfdf5",
        color: toast.type === "error" ? "#991b1b" : "#065f46",
        border: `2px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
        boxShadow: "3px 3px 0 #111"
      }}>
        {toast.message}
      </div>
    )}
      <GlobalStyles />
      <Nav showToast={showToast} />
      <Hero />
      <Ticker />
      <ProblemSolution />
      <HowItWorks />
      <Dashboard />
      <CampaignsSection showToast={showToast} />
      <TrustFeatures />
      <FailureModes />
      <CTA />
      <Footer />
    </>
    
  );
  
  
}