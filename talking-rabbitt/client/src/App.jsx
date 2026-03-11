import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Inline SVG Charts ─────────────────────────────────────────────────────────
function BarChart({ labels, values, title, color = "#00e5a0" }) {
  const max = Math.max(...values, 1);
  const fmt = v =>
    v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr`
    : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000 ? `${(v / 1000).toFixed(1)}K`
    : v < 1 && v > 0 ? `${(v * 100).toFixed(1)}%`
    : Number(v).toLocaleString();

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{title}</div>
      {labels.map((label, i) => (
        <div key={i} style={{ marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>
            <span style={{ maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            <span style={{ color: "#e2e8f0", fontWeight: 600, flexShrink: 0 }}>{fmt(values[i])}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(values[i] / max) * 100}%`,
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              borderRadius: 4, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ labels, values, title, color = "#f59e0b" }) {
  const W = 340, H = 100, pad = 24;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${(pad + (values.length - 1) / Math.max(values.length - 1, 1) * (W - pad * 2)).toFixed(1)},${H - pad} L${pad},${H - pad} Z`;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{title}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lg)" />
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((_, i) => {
          const [x, y] = pts[i].split(",");
          return <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#0f172a" strokeWidth="2" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginTop: 2 }}>
        {labels.map((l, i) => <span key={i} style={{ maxWidth: 50, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>)}
      </div>
    </div>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 2px" }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#00e5a0",
          animation: `bounce 1.2s ${d}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Render text with bold/italic ──────────────────────────────────────────────
function renderMd(text) {
  return { __html: text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>").replace(/\n/g, "<br/>") };
}

const EXAMPLE_QUESTIONS = [
  "Which category had the highest revenue?",
  "Show monthly sales trend",
  "Which region has the highest churn?",
  "What was the best performing month?",
  "Compare orders by category",
  "Summarize the dataset for me",
];

const FLIPKART_CSV = `date,product_category,region,revenue,orders,customer_churn
2024-01-01,Mobiles & Electronics,Metro,18500000,42000,0.032
2024-01-01,Fashion,North,7200000,61000,0.071
2024-01-01,Home & Furniture,South,5400000,18000,0.041
2024-01-01,Appliances,Metro,9100000,12000,0.028
2024-01-01,Beauty & Personal Care,South,3200000,38000,0.058
2024-01-01,Sports & Fitness,North,2800000,21000,0.046
2024-01-01,Books & Media,East,1100000,29000,0.062
2024-01-01,Grocery,Metro,4600000,95000,0.019
2024-02-01,Mobiles & Electronics,Metro,19200000,44500,0.030
2024-02-01,Fashion,North,8100000,67000,0.068
2024-02-01,Home & Furniture,South,5900000,19500,0.039
2024-02-01,Appliances,Metro,8700000,11500,0.031
2024-02-01,Beauty & Personal Care,South,3800000,44000,0.054
2024-02-01,Sports & Fitness,North,3100000,23500,0.043
2024-02-01,Books & Media,East,1050000,27000,0.065
2024-02-01,Grocery,Metro,5100000,102000,0.017
2024-03-01,Mobiles & Electronics,Metro,21500000,49000,0.028
2024-03-01,Fashion,North,11400000,89000,0.061
2024-03-01,Home & Furniture,South,6800000,22000,0.037
2024-03-01,Appliances,Metro,9800000,13200,0.026
2024-03-01,Beauty & Personal Care,South,5200000,58000,0.049
2024-03-01,Sports & Fitness,North,3700000,28000,0.041
2024-03-01,Books & Media,East,980000,25500,0.069
2024-03-01,Grocery,Metro,5900000,118000,0.016
2024-04-01,Mobiles & Electronics,Metro,20100000,46000,0.031
2024-04-01,Fashion,North,9300000,74000,0.066
2024-04-01,Home & Furniture,South,6200000,20500,0.040
2024-04-01,Appliances,Metro,10200000,13800,0.025
2024-04-01,Beauty & Personal Care,South,4100000,47000,0.052
2024-04-01,Sports & Fitness,North,3400000,26000,0.044
2024-04-01,Books & Media,East,1020000,26500,0.063
2024-04-01,Grocery,Metro,5400000,109000,0.018
2024-05-01,Mobiles & Electronics,Metro,22800000,51000,0.027
2024-05-01,Fashion,North,9800000,78000,0.064
2024-05-01,Home & Furniture,South,6500000,21500,0.038
2024-05-01,Appliances,Metro,11500000,15100,0.023
2024-05-01,Beauty & Personal Care,South,4500000,52000,0.050
2024-05-01,Sports & Fitness,North,3900000,30000,0.040
2024-05-01,Books & Media,East,890000,23000,0.071
2024-05-01,Grocery,Metro,6200000,124000,0.015
2024-06-01,Mobiles & Electronics,Metro,21400000,48500,0.029
2024-06-01,Fashion,North,10200000,82000,0.062
2024-06-01,Home & Furniture,South,7100000,23000,0.036
2024-06-01,Appliances,Metro,12800000,16500,0.022
2024-06-01,Beauty & Personal Care,South,4900000,56000,0.048
2024-06-01,Sports & Fitness,North,4200000,32000,0.038
2024-06-01,Books & Media,East,820000,21000,0.074
2024-06-01,Grocery,Metro,6800000,136000,0.014
2024-07-01,Mobiles & Electronics,Metro,23500000,53000,0.026
2024-07-01,Fashion,North,10900000,87000,0.059
2024-07-01,Home & Furniture,South,7600000,24500,0.034
2024-07-01,Appliances,Metro,13200000,17200,0.021
2024-07-01,Beauty & Personal Care,South,5300000,61000,0.046
2024-07-01,Sports & Fitness,North,4600000,35000,0.036
2024-07-01,Books & Media,East,780000,20000,0.077
2024-07-01,Grocery,Metro,7400000,148000,0.013
2024-08-01,Mobiles & Electronics,Metro,26800000,61000,0.024
2024-08-01,Fashion,North,13500000,108000,0.055
2024-08-01,Home & Furniture,South,9200000,30000,0.031
2024-08-01,Appliances,Metro,15600000,20300,0.019
2024-08-01,Beauty & Personal Care,South,6100000,70000,0.043
2024-08-01,Sports & Fitness,North,5200000,40000,0.033
2024-08-01,Books & Media,East,920000,24000,0.068
2024-08-01,Grocery,Metro,8100000,162000,0.012
2024-09-01,Mobiles & Electronics,Metro,24100000,55000,0.027
2024-09-01,Fashion,North,11800000,94000,0.058
2024-09-01,Home & Furniture,South,8100000,26500,0.033
2024-09-01,Appliances,Metro,14100000,18400,0.020
2024-09-01,Beauty & Personal Care,South,5700000,65000,0.045
2024-09-01,Sports & Fitness,North,4900000,37500,0.035
2024-09-01,Books & Media,East,850000,22000,0.072
2024-09-01,Grocery,Metro,7700000,154000,0.013
2024-10-01,Mobiles & Electronics,Metro,68000000,155000,0.018
2024-10-01,Fashion,North,34500000,276000,0.042
2024-10-01,Home & Furniture,South,22100000,72000,0.022
2024-10-01,Appliances,Metro,41200000,53500,0.014
2024-10-01,Beauty & Personal Care,South,16800000,192000,0.031
2024-10-01,Sports & Fitness,North,13400000,103000,0.025
2024-10-01,Books & Media,East,2900000,75000,0.048
2024-10-01,Grocery,Metro,19500000,390000,0.009
2024-11-01,Mobiles & Electronics,Metro,25600000,58000,0.025
2024-11-01,Fashion,North,12400000,99000,0.057
2024-11-01,Home & Furniture,South,8800000,28500,0.032
2024-11-01,Appliances,Metro,15200000,19800,0.021
2024-11-01,Beauty & Personal Care,South,6300000,72000,0.044
2024-11-01,Sports & Fitness,North,5100000,39000,0.037
2024-11-01,Books & Media,East,1100000,28500,0.065
2024-11-01,Grocery,Metro,8500000,170000,0.012
2024-12-01,Mobiles & Electronics,Metro,28400000,64500,0.024
2024-12-01,Fashion,North,14100000,113000,0.054
2024-12-01,Home & Furniture,South,10200000,33000,0.030
2024-12-01,Appliances,Metro,17400000,22600,0.019
2024-12-01,Beauty & Personal Care,South,7200000,82000,0.041
2024-12-01,Sports & Fitness,North,5800000,44500,0.034
2024-12-01,Books & Media,East,1350000,35000,0.060
2024-12-01,Grocery,Metro,9300000,186000,0.011`;

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 I'm **Rabbitt** — your AI business analyst.\n\nUpload any sales CSV, or click **\"Use Flipkart Demo Data\"** to load sample data instantly. Then ask me anything about your data.",
      chart: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(true);
  const [dataContext, setDataContext] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Upload CSV ──────────────────────────────────────────────────────────────
  async function handleFileUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) { setUploadError(data.error); return; }
      setDataContext(data);
      historyRef.current = [];
      setMessages([{
        role: "assistant",
        content: `✅ **${data.fileName}** loaded successfully!\n\n📊 **${data.rowCount} rows** · **${data.columns.length} columns**: ${data.columns.join(", ")}\n\nI'm ready. Ask me anything about this data!`,
        chart: null,
      }]);
    } catch (err) {
      setUploadError("Upload failed. Is the server running?");
    } finally {
      setUploading(false);
    }
  }

  // ── Load demo data ──────────────────────────────────────────────────────────
  async function loadDemoData() {
    const blob = new Blob([FLIPKART_CSV], { type: "text/csv" });
    const file = new File([blob], "flipkart_sales_2024.csv", { type: "text/csv" });
    await handleFileUpload(file);
  }

  // ── Send query ──────────────────────────────────────────────────────────────
  async function sendMessage(q) {
    const question = q || input.trim();
    if (!question || loading) return;
    if (!dataContext) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Please upload a CSV file first — or click **\"Use Flipkart Demo Data\"** to get started instantly!", chart: null }]);
      return;
    }
    setInput("");

    const userMsg = { role: "user", content: question, chart: null };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          dataContext,
          history: historyRef.current,
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: question },
        { role: "assistant", content: data.answer },
      ].slice(-10);

      setMessages(prev => [...prev, { role: "assistant", content: data.answer, chart: data.chart }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}`, chart: null }]);
    } finally {
      setLoading(false);
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: "#070b12", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", color: "#e2e8f0" },
    header: { padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,11,18,0.97)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", gap: 12 },
    logo: { width: 36, height: 36, background: "linear-gradient(135deg,#00e5a0,#00b8d9)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
    body: { display: "flex", flex: 1, overflow: "hidden", maxHeight: "calc(100vh - 62px)" },
    sidebar: { width: 220, borderRight: "1px solid rgba(255,255,255,0.05)", padding: "16px 14px", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    chatArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },
    msgRow: role => ({ display: "flex", justifyContent: role === "user" ? "flex-end" : "flex-start", gap: 8 }),
    bubble: role => ({
      maxWidth: role === "user" ? "68%" : "84%",
      background: role === "user" ? "linear-gradient(135deg,#1e3a5f,#1a2f4e)" : "rgba(255,255,255,0.04)",
      border: role === "user" ? "1px solid rgba(0,180,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
      padding: "12px 15px", fontSize: 14, lineHeight: 1.65,
      color: role === "user" ? "#bfdbfe" : "#cbd5e1",
    }),
    av: { width: 28, height: 28, background: "linear-gradient(135deg,#00e5a0,#00b8d9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 },
    chartBox: { marginTop: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" },
    inputRow: { padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, alignItems: "flex-end" },
    inputBox: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11, padding: "11px 15px", color: "#e2e8f0", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 },
    sendBtn: { background: loading ? "rgba(0,229,160,0.15)" : "linear-gradient(135deg,#00e5a0,#00b8d9)", border: "none", borderRadius: 11, width: 42, height: 42, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#070b12", fontWeight: 800, flexShrink: 0 },
    sideLabel: { fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 },
    exBtn: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px", color: "#94a3b8", fontSize: 12, cursor: "pointer", textAlign: "left", marginBottom: 5, lineHeight: 1.4, transition: "all 0.15s" },
    uploadArea: { border: "1.5px dashed rgba(0,229,160,0.3)", borderRadius: 10, padding: "14px 10px", textAlign: "center", cursor: "pointer", background: "rgba(0,229,160,0.04)", transition: "all 0.2s" },
    demoBtn: { width: "100%", background: "linear-gradient(135deg,rgba(0,229,160,0.15),rgba(0,184,217,0.15))", border: "1px solid rgba(0,229,160,0.3)", borderRadius: 8, padding: "9px 10px", color: "#00e5a0", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 6 },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "30px 26px", width: 360, maxWidth: "90vw" },
  };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .msg { animation: fadeUp 0.3s ease forwards; }
        .ex-btn:hover { background: rgba(0,229,160,0.08) !important; color: #00e5a0 !important; }
        .upload-area:hover { border-color: rgba(0,229,160,0.6) !important; background: rgba(0,229,160,0.08) !important; }
      `}</style>

      {/* API Key Modal */}
      {showKeyModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🐇</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Welcome to Talking Rabbitt</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 1.6 }}>
              Enter your <strong style={{ color: "#94a3b8" }}>xAI Grok API key</strong> to power the AI analyst.
              Your key is never stored or sent anywhere except xAI.
            </div>
            <input
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, padding: "10px 13px", color: "#e2e8f0", fontSize: 13, outline: "none", marginTop: 14, fontFamily: "monospace" }}
              type="password"
              placeholder="xai-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && apiKey.length > 10) setShowKeyModal(false); }}
              autoFocus
            />
            <div style={{ fontSize: 11, color: "#475569", marginTop: 7 }}>Get your key at <span style={{ color: "#00e5a0" }}>console.x.ai</span></div>
            <button
              style={{ marginTop: 14, width: "100%", background: apiKey.length > 10 ? "linear-gradient(135deg,#00e5a0,#00b8d9)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 9, padding: "12px", color: apiKey.length > 10 ? "#070b12" : "#475569", fontWeight: 700, fontSize: 14, cursor: apiKey.length > 10 ? "pointer" : "not-allowed" }}
              onClick={() => { if (apiKey.length > 10) setShowKeyModal(false); }}
            >
              Launch Rabbitt →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>🐇</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.3px" }}>Talking Rabbitt</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Conversational AI for Business Data</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {dataContext ? (
            <>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e5a0", boxShadow: "0 0 8px #00e5a0" }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{dataContext.fileName} · {dataContext.rowCount} rows</span>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "#475569" }}>No data loaded</span>
          )}
        </div>
      </header>

      <div style={S.body}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          {/* Upload */}
          <div>
            <div style={S.sideLabel}>Your Data</div>
            <div
              className="upload-area"
              style={S.uploadArea}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{uploading ? "⏳" : "📂"}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                {uploading ? "Uploading..." : "Drop CSV here\nor click to browse"}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => handleFileUpload(e.target.files[0])} />
            {uploadError && <div style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>{uploadError}</div>}
            <button style={S.demoBtn} onClick={loadDemoData}>
              🎯 Use Flipkart Demo Data
            </button>
          </div>

          {/* Example questions */}
          <div>
            <div style={S.sideLabel}>Try Asking</div>
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <button key={i} className="ex-btn" style={S.exBtn} onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          {/* Dataset info if loaded */}
          {dataContext && (
            <div>
              <div style={S.sideLabel}>Loaded Dataset</div>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                📄 {dataContext.fileName}<br />
                📊 {dataContext.rowCount} rows<br />
                🗂 {dataContext.columns.length} columns<br />
                {dataContext.columns.map(c => (
                  <span key={c} style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 5px", margin: "2px 2px 0 0", fontSize: 10, color: "#64748b" }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main chat */}
        <main style={S.main}>
          <div style={S.chatArea}>
            {messages.map((msg, i) => (
              <div key={i} className="msg" style={S.msgRow(msg.role)}>
                {msg.role === "assistant" && <div style={S.av}>🐇</div>}
                <div style={S.bubble(msg.role)}>
                  <div dangerouslySetInnerHTML={renderMd(msg.content)} />
                  {msg.chart && msg.chart.type !== "none" && (
                    <div style={S.chartBox}>
                      {msg.chart.type === "bar" && (
                        <BarChart labels={msg.chart.labels} values={msg.chart.values} title={msg.chart.title} color={msg.chart.color || "#00e5a0"} />
                      )}
                      {msg.chart.type === "line" && (
                        <LineChart labels={msg.chart.labels} values={msg.chart.values} title={msg.chart.title} color={msg.chart.color || "#f59e0b"} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={S.msgRow("assistant")}>
                <div style={S.av}>🐇</div>
                <div style={{ ...S.bubble("assistant"), padding: "14px 16px" }}><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={S.inputRow}>
            <textarea
              style={S.inputBox}
              placeholder={dataContext ? "Ask anything about your data… (Enter to send, Shift+Enter for new line)" : "Upload a CSV first, or load the Flipkart demo data →"}
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button style={S.sendBtn} onClick={() => sendMessage()} disabled={loading}>↑</button>
          </div>
        </main>
      </div>
    </div>
  );
}
