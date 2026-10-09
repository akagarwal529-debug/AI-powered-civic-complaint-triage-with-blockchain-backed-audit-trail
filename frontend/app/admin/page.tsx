"use client";

import { useState, useEffect } from "react";
import { getTokenBalance, BACKEND_URL, DEMO_WALLET } from "@/lib/contract";
import { useToast } from "@/components/Toast";

const SAMPLES = [
  "Massive pothole near banyan tree on MG Road, almost crashed my bike today",
  "Streetlight outside house 42 on Nehru Nagar flickering for a week",
  "Water pipe bursting near sector 4 park, road flooded for 3 days",
  "Garbage not collected in Rajaji Nagar for 5 days",
];

export default function Home() {
  const [balance, setBalance] = useState("0");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, resolved: 0, critical: 0 });
  const { show } = useToast();

  useEffect(() => {
    getTokenBalance(DEMO_WALLET).then(setBalance);
    fetch(`${BACKEND_URL}/complaints`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.complaints || [];
        setStats({
          total: list.length,
          resolved: list.filter((c: any) => c.resolved).length,
          critical: list.filter((c: any) => c.severity >= 5).length,
        });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return show("Enter a complaint first", "error");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, reporter_address: DEMO_WALLET }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setText("");
      show("Complaint logged on-chain! +10 CIVIC earned", "success");
      setBalance(await getTokenBalance(DEMO_WALLET));
      setStats((s) => ({
        ...s,
        total: s.total + 1,
        critical: data.structured.severity >= 5 ? s.critical + 1 : s.critical,
      }));
    } catch (e: any) {
      show("Failed: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const sev = result?.structured?.severity ?? 0;
  const sevStyle =
    sev >= 5
      ? { text: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/40", dot: "bg-red-400", label: "CRITICAL" }
      : sev === 4
      ? { text: "text-orange-300", bg: "bg-orange-500/15", border: "border-orange-500/40", dot: "bg-orange-400", label: "HIGH" }
      : sev === 3
      ? { text: "text-yellow-300", bg: "bg-yellow-500/15", border: "border-yellow-500/40", dot: "bg-yellow-400", label: "MEDIUM" }
      : { text: "text-green-300", bg: "bg-green-500/15", border: "border-green-500/40", dot: "bg-green-400", label: "LOW" };

  return (
    <main className="relative z-10">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-up border border-blue-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-medium text-blue-200 tracking-wide">
              AI + Blockchain · Live Demo
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <span className="text-blue-50">Fix the</span>{" "}
            <span className="gradient-text">Present.</span>
            <br />
            <span className="text-blue-50">Build the</span>{" "}
            <span className="gradient-text-bright">Future.</span>
          </h1>

          <p className="text-lg text-blue-200/60 leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.15s" }}>
            Report civic issues in plain language. Our AI classifies and prioritizes them.
            The blockchain makes the record permanent.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.25s" }}>
            {[
              { label: "Reports", val: stats.total, accent: "from-blue-500/20 to-blue-500/0", text: "text-blue-300" },
              { label: "Resolved", val: stats.resolved, accent: "from-green-500/20 to-green-500/0", text: "text-green-300" },
              { label: "Critical", val: stats.critical, accent: "from-red-500/20 to-red-500/0", text: "text-red-300" },
            ].map((s, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-4 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`text-3xl font-extrabold ${s.text} relative`}>{s.val}</div>
                <div className="text-[10px] text-blue-300/50 uppercase tracking-widest mt-1 relative">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Composer */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="glass-2 rounded-3xl p-1.5 shadow-2xl animate-fade-up shadow-blue-500/10" style={{ animationDelay: "0.35s" }}>
          <div className="rounded-[20px] bg-blue-950/20 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm text-white">
                  ✦
                </div>
                <span className="text-sm font-semibold text-blue-100">
                  New Report
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-300/50">Balance</span>
                <span className="font-mono font-semibold text-blue-300">
                  {parseFloat(balance).toFixed(0)} CIVIC
                </span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the issue in your own words..."
              rows={4}
              className="w-full bg-transparent border-0 outline-none resize-none text-blue-50 placeholder:text-blue-300/30 text-base leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
            />

            <div className="flex flex-wrap gap-2 mt-3 mb-5">
              {SAMPLES.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setText(s)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/20 text-blue-300/60 hover:text-blue-200 hover:border-blue-400/50 transition-colors"
                >
                  {s.slice(0, 28)}…
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-blue-500/10 pt-4">
              <div className="flex items-center gap-2 text-xs text-blue-300/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-700/30 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-200">
                  R
                </div>
                <span className="font-mono">
                  {DEMO_WALLET.slice(0, 6)}…{DEMO_WALLET.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className="btn-primary px-5 py-2.5 text-sm text-white flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing
                  </>
                ) : (
                  <>Submit <span className="text-white/60 text-xs">⌘↵</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-6 animate-fade-up">
            <div className={`glass-2 rounded-3xl overflow-hidden border ${sevStyle.border}`}>
              <div className={`px-6 py-4 ${sevStyle.bg} border-b ${sevStyle.border} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse-slow ${sevStyle.dot}`}></div>
                  <span className={`text-xs font-bold tracking-widest ${sevStyle.text}`}>
                    {sevStyle.label} · SEVERITY {sev}/5
                  </span>
                </div>
                <div className="text-xs text-blue-300/50 font-mono">
                  Block #{result.block}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="section-label mb-2">AI Summary</div>
                  <p className="text-blue-100 leading-relaxed">
                    {result.structured.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Category", result.structured.category],
                    ["Type", result.structured.sub_category],
                    ["Department", result.structured.department],
                    ["Location", result.structured.location],
                  ].map(([k, v], i) => (
                    <div key={i} className="bg-blue-950/40 rounded-xl p-3 border border-blue-500/15">
                      <div className="section-label mb-1 text-[10px]">{k}</div>
                      <div className="text-sm font-semibold text-blue-100 truncate">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-blue-950/40 border border-blue-500/15 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-300/50">Transaction</span>
                    <span className="font-mono text-blue-300 truncate max-w-[240px]">
                      {result.tx_hash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-300/50">IPFS</span>
                    <span className="font-mono text-blue-300/70 truncate max-w-[240px]">
                      {result.ipfs_hash}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-300 pt-1">
                  <span>◆</span> +10 CIVIC earned
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}