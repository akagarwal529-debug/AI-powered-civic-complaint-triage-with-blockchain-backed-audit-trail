export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
export const DEMO_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

export async function getTokenBalance(address: string): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/balance/${address}`);
    const data = await res.json();
    return data.balance || "0";
  } catch {
    return "0";
  }
}

export type Complaint = {
  id: number;
  ipfs_hash: string;
  severity: number;
  department: string;
  reporter: string;
  timestamp: number;
  resolved: boolean;
  structured: any;
};

export function getSeverityColor(s: number) {
  if (s >= 5) return { border: "border-red-500", bg: "bg-red-950/40", text: "text-red-400", label: "CRITICAL", dot: "bg-red-500" };
  if (s === 4) return { border: "border-orange-500", bg: "bg-orange-950/40", text: "text-orange-400", label: "HIGH", dot: "bg-orange-500" };
  if (s === 3) return { border: "border-yellow-500", bg: "bg-yellow-950/40", text: "text-yellow-400", label: "MEDIUM", dot: "bg-yellow-500" };
  return { border: "border-green-500", bg: "bg-green-950/40", text: "text-green-400", label: "LOW", dot: "bg-green-500" };
}