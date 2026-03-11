import { useState, useEffect } from "react";

const sha256Mock = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return hex.repeat(8).slice(0, 64);
};

const createBlock = (index, data, previousHash) => {
  const timestamp = new Date().toLocaleTimeString();
  const hash = sha256Mock(`${index}${timestamp}${data}${previousHash}`);
  return { index, timestamp, data, previousHash, hash };
};

const INITIAL_CHAIN = (() => {
  const genesis = createBlock(0, "Genesis Block", "0".repeat(64));
  const b1 = createBlock(1, "Alice → Bob: 10 BTC", genesis.hash);
  const b2 = createBlock(2, "Bob → Carol: 3 BTC", b1.hash);
  return [genesis, b1, b2];
})();

export default function Blockchain() {
  const [chain, setChain] = useState(INITIAL_CHAIN);
  const [newData, setNewData] = useState("");
  const [tamperedIndex, setTamperedIndex] = useState(null);
  const [animating, setAnimating] = useState(null);

  const isValid = (c = chain) => {
    for (let i = 1; i < c.length; i++) {
      if (c[i].previousHash !== c[i - 1].hash) return false;
    }
    return true;
  };

  const addBlock = () => {
    if (!newData.trim()) return;
    const prev = chain[chain.length - 1];
    const block = createBlock(chain.length, newData, prev.hash);
    setAnimating(block.index);
    setTimeout(() => setAnimating(null), 600);
    setChain([...chain, block]);
    setNewData("");
    setTamperedIndex(null);
  };

  const tamper = (idx) => {
    const updated = chain.map((b, i) =>
      i === idx ? { ...b, data: "🔥 TAMPERED DATA 🔥" } : b
    );
    setChain(updated);
    setTamperedIndex(idx);
  };

  const reset = () => {
    setChain(INITIAL_CHAIN);
    setTamperedIndex(null);
    setNewData("");
  };

  const valid = isValid();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Courier New', monospace",
      color: "#e0e0e0",
      padding: "32px 24px",
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,80,80,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(255,80,80,0); }
        }
        .block-card { transition: transform 0.2s; }
        .block-card:hover { transform: translateY(-2px); }
        input::placeholder { color: #444; }
        input:focus { outline: none; border-color: #4ade80 !important; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#4ade80", marginBottom: 8 }}>
            DISTRIBUTED LEDGER DEMO
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>
            🔗 SIMPLE BLOCKCHAIN
          </h1>
          <div style={{
            display: "inline-block", marginTop: 16, padding: "6px 20px",
            background: valid ? "rgba(74,222,128,0.1)" : "rgba(255,80,80,0.1)",
            border: `1px solid ${valid ? "#4ade80" : "#ff5050"}`,
            borderRadius: 4, fontSize: 12, letterSpacing: 2,
            color: valid ? "#4ade80" : "#ff5050",
            animation: !valid ? "pulse 1.5s infinite" : "none",
          }}>
            {valid ? "✓ CHAIN INTACT" : "✗ CHAIN COMPROMISED"}
          </div>
        </div>

        {/* Chain */}
        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: "fit-content" }}>
            {chain.map((block, i) => {
              const broken = tamperedIndex !== null && i >= tamperedIndex;
              const isNew = animating === block.index;
              return (
                <div key={block.index} style={{ display: "flex", alignItems: "center" }}>
                  {/* Block Card */}
                  <div className="block-card" style={{
                    width: 210,
                    background: broken
                      ? "linear-gradient(135deg, #1a0808, #120808)"
                      : i === 0
                        ? "linear-gradient(135deg, #0d1a0d, #081208)"
                        : "linear-gradient(135deg, #0d1020, #080d1a)",
                    border: `1px solid ${broken ? "#ff5050" : i === 0 ? "#4ade80" : "#2a3a6a"}`,
                    borderRadius: 8,
                    padding: "16px 14px",
                    animation: isNew ? "slideIn 0.5s ease" : "none",
                    boxShadow: broken
                      ? "0 0 20px rgba(255,80,80,0.15)"
                      : i === 0
                        ? "0 0 20px rgba(74,222,128,0.08)"
                        : "0 4px 20px rgba(0,0,0,0.4)",
                  }}>
                    {/* Block header */}
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 12,
                    }}>
                      <span style={{
                        fontSize: 10, letterSpacing: 3,
                        color: broken ? "#ff5050" : i === 0 ? "#4ade80" : "#6090ff",
                      }}>
                        BLOCK
                      </span>
                      <span style={{
                        fontSize: 18, fontWeight: 700,
                        color: broken ? "#ff5050" : "#fff",
                      }}>#{block.index}</span>
                    </div>

                    {/* Fields */}
                    {[
                      { label: "TIME", value: block.timestamp },
                      { label: "DATA", value: block.data, highlight: broken && i === tamperedIndex },
                      { label: "PREV", value: block.previousHash.slice(0, 10) + "…" },
                      { label: "HASH", value: block.hash.slice(0, 10) + "…", isHash: true },
                    ].map(({ label, value, highlight, isHash }) => (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, letterSpacing: 2, color: "#444", marginBottom: 2 }}>
                          {label}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: highlight ? "#ff5050"
                            : isHash && broken ? "#ff5050"
                            : isHash ? "#4ade80"
                            : "#ccc",
                          wordBreak: "break-all",
                          fontWeight: highlight ? 700 : 400,
                        }}>
                          {value}
                        </div>
                      </div>
                    ))}

                    {/* Tamper button */}
                    {i > 0 && tamperedIndex === null && (
                      <button onClick={() => tamper(i)} style={{
                        marginTop: 10, width: "100%", padding: "5px 0",
                        background: "transparent", border: "1px solid #333",
                        color: "#666", fontSize: 10, letterSpacing: 2,
                        cursor: "pointer", borderRadius: 3,
                      }}
                        onMouseOver={e => { e.target.style.borderColor = "#ff5050"; e.target.style.color = "#ff5050"; }}
                        onMouseOut={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#666"; }}
                      >
                        TAMPER
                      </button>
                    )}
                    {broken && i === tamperedIndex && (
                      <div style={{ marginTop: 10, fontSize: 10, color: "#ff5050", textAlign: "center", letterSpacing: 1 }}>
                        ⚠ HASH MISMATCH
                      </div>
                    )}
                  </div>

                  {/* Connector arrow */}
                  {i < chain.length - 1 && (
                    <div style={{ display: "flex", alignItems: "center", padding: "0 6px", marginTop: -30 }}>
                      <div style={{
                        width: 24, height: 2,
                        background: broken && i >= tamperedIndex - 1 ? "#ff5050" : "#2a3a6a",
                      }} />
                      <div style={{
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent",
                        borderLeft: `7px solid ${broken && i >= tamperedIndex - 1 ? "#ff5050" : "#2a3a6a"}`,
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add block */}
        <div style={{
          marginTop: 36, padding: 24,
          background: "#0d0d18", border: "1px solid #1a2a4a",
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#6090ff", marginBottom: 16 }}>
            ADD NEW BLOCK
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={newData}
              onChange={e => setNewData(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addBlock()}
              placeholder="Enter transaction data..."
              style={{
                flex: 1, background: "#060610", border: "1px solid #1a2a4a",
                borderRadius: 4, padding: "10px 14px", color: "#e0e0e0",
                fontSize: 13, fontFamily: "'Courier New', monospace",
              }}
            />
            <button onClick={addBlock} style={{
              padding: "10px 24px", background: "#4ade80",
              border: "none", borderRadius: 4, color: "#000",
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
              cursor: "pointer",
            }}>
              MINE BLOCK
            </button>
          </div>
        </div>

        {/* Reset */}
        {(tamperedIndex !== null || chain.length > 3) && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={reset} style={{
              background: "transparent", border: "1px solid #333",
              color: "#555", padding: "8px 24px", borderRadius: 4,
              fontSize: 11, letterSpacing: 2, cursor: "pointer",
            }}
              onMouseOver={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "#555"; }}
              onMouseOut={e => { e.target.style.color = "#555"; e.target.style.borderColor = "#333"; }}
            >
              RESET CHAIN
            </button>
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: 40, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { color: "#4ade80", label: "Genesis Block" },
            { color: "#6090ff", label: "Valid Block" },
            { color: "#ff5050", label: "Tampered / Broken Link" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: "#444", letterSpacing: 1 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
