"use client";

import { useState, useEffect } from "react";
import { getTokenBalance, BACKEND_URL, DEMO_WALLET } from "@/lib/contract";
import { useToast } from "@/components/Toast";

const SAMPLE_COMPLAINTS = [
  "Massive pothole near banyan tree on MG Road, almost crashed my bike today",
  "Streetlight outside house 42 on Nehru Nagar flickering for a week, kids can't study",
  "Water pipe bursting near sector 4 park, road flooded for 3 days",
  "Garbage not collected in Rajaji Nagar for 5 days, terrible smell",
  "Drain overflowing near primary school, children getting sick",
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
    if (!text.trim()) {
      show("Please enter a complaint", "error");
      return;
    }
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
      const bal = await getTokenBalance(DEMO_WALLET);
      setBalance(bal);
      setStats((s) => ({
        ...s,
        total: s.total + 1,
        critical: data.structured.severity >= 5 ? s.critical + 1 : s.critical,
      }));
    } catch (e: any) {
      show("Failed to submit: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-medium text-cyan-300">
                AI + Blockchain Live Demo
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Fix the Present.
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-200 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Build the Future.
            </h2>
            <p className="text-lg text-slate-400 mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Report civic issues in plain text. Our AI classifies, prioritizes,
              and routes them — permanently on-chain.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Total Reports", value: stats.total, color: "text-cyan-400" },
              { label: "Resolved", value: stats.resolved, color: "text-green-400" },
              { label: "Critical", value: stats.critical, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center card-hover">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        {/* Reporter status card */}
        <div className="glass rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold">
              R
            </div>
            <div>
              <div className="text-xs text-slate-400">Connected Reporter</div>
              <div className="text-sm font-mono text-slate-200">
                {DEMO_WALLET.slice(0, 10)}...{DEMO_WALLET.slice(-8)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Civic Tokens</div>
            <div className="text-lg font-bold text-cyan-400">
              {parseFloat(balance).toFixed(0)} CIVIC
            </div>
          </div>
        </div>

        {/* Submit Form */}
        <div className="glass-strong rounded-2xl p-8 border border-slate-800/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">
                Report a Civic Issue
              </h3>
              <p className="text-sm text-slate-400">
                Describe it in your own words — we'll handle the rest
              </p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Massive pothole near banyan tree on MG Road, almost crashed my bike today."
            className="w-full h-32 p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none text-sm transition-all"
          />

          {/* Sample chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 mr-1">Try:</span>
            {SAMPLE_COMPLAINTS.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setText(s)}
                className="text-xs px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
              >
                {s.slice(0, 30)}...
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-40 transition-all animate-gradient"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI is processing...
              </span>
            ) : (
              "Submit Complaint →"
            )}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mt-8 glass-strong rounded-2xl p-8 border-2 border-cyan-500/50 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-2xl animate-pulse-glow">
                ✅
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400">
                  Complaint Logged On-Chain
                </h3>
                <p className="text-xs text-slate-400">
                  Block #{result.block} · Tx {result.tx_hash.slice(0, 10)}...
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Category", value: result.structured.category },
                { label: "Sub-category", value: result.structured.sub_category },
                {
                  label: "Severity",
                  value: `${result.structured.severity}/5`,
                  highlight: true,
                },
                { label: "Department", value: result.structured.department },
                { label: "Location", value: result.structured.location },
                { label: "Duration", value: result.structured.duration },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 rounded-xl p-3 border border-slate-800"
                >
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div
                    className={`text-sm font-semibold ${
                      item.highlight ? "text-red-400" : "text-slate-200"
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-4">
              <div className="text-xs text-slate-500 mb-1">AI Summary</div>
              <div className="text-sm text-slate-200">
                {result.structured.summary}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-500">
              <div className="truncate">Tx: {result.tx_hash}</div>
              <div className="truncate">IPFS: {result.ipfs_hash}</div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <span>🪙</span>
              <span>+10 CIVIC tokens earned</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}