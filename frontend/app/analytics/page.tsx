"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL, getSeverityColor, type Complaint } from "@/lib/contract";

export default function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/complaints`)
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Aggregate by category
  const byCategory: Record<string, number> = {};
  complaints.forEach((c) => {
    const cat = c.structured?.category || "Unknown";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });
  const categoryData = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...categoryData.map((d) => d[1]), 1);

  // Severity distribution
  const sevDist = [1, 2, 3, 4, 5].map(
    (s) => complaints.filter((c) => c.severity === s).length
  );
  const maxSev = Math.max(...sevDist, 1);

  // By department
  const byDept: Record<string, number> = {};
  complaints.forEach((c) => {
    byDept[c.department] = (byDept[c.department] || 0) + 1;
  });
  const deptData = Object.entries(byDept).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
              <p className="text-sm text-slate-400">
                Insights from the blockchain complaint ledger
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-80 skeleton"></div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No data yet
            </h3>
            <p className="text-sm text-slate-500">
              Submit complaints to see analytics
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">
                Complaints by Category
              </h2>
              <div className="space-y-4">
                {categoryData.map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-cyan-400 font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / maxCat) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-lg font-semibold text-slate-100 mb-6">
                Severity Distribution
              </h2>
              <div className="flex items-end justify-between gap-3 h-48">
                {sevDist.map((count, i) => {
                  const sev = i + 1;
                  const style = getSeverityColor(sev);
                  return (
                    <div key={sev} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-slate-400 font-semibold">
                        {count}
                      </div>
                      <div
                        className={`w-full rounded-t-lg ${style.dot} transition-all duration-1000`}
                        style={{
                          height: `${(count / maxSev) * 100}%`,
                          minHeight: "4px",
                        }}
                      ></div>
                      <div className={`text-xs font-bold ${style.text}`}>
                        {style.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Load */}
            <div className="glass rounded-2xl p-6 lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-lg font-semibold text-slate-100 mb-6">
                Department Workload
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {deptData.map(([dept, count]) => (
                  <div
                    key={dept}
                    className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 card-hover"
                  >
                    <div className="text-2xl font-bold text-cyan-400 mb-1">
                      {count}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {dept}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="glass rounded-2xl p-6 lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-lg font-semibold text-slate-100 mb-6">
                Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Complaints", value: complaints.length },
                  {
                    label: "Resolution Rate",
                    value: `${(
                      (complaints.filter((c) => c.resolved).length /
                        complaints.length) *
                      100
                    ).toFixed(0)}%`,
                  },
                  {
                    label: "Critical Issues",
                    value: complaints.filter((c) => c.severity >= 5).length,
                  },
                  {
                    label: "Avg Severity",
                    value: (
                      complaints.reduce((s, c) => s + c.severity, 0) /
                      complaints.length
                    ).toFixed(1),
                  },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-1">
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}