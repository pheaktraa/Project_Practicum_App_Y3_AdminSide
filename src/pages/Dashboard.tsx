import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Users,
  Truck,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "../components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Delivery {
  id: string;
  userId?: string;
  userName?: string;
  transporter?: string;
  amount?: number;
  status?: "Completed" | "In Transit" | "Pending" | "Cancelled";
  createdAt?: { seconds: number };
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  totalUsers: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND = "#FF6B4A";

const WEEKLY_DATA = [
  { day: "Sun", deliveries: 14 },
  { day: "Mon", deliveries: 28 },
  { day: "Tue", deliveries: 22 },
  { day: "Wed", deliveries: 35 },
  { day: "Thu", deliveries: 18 },
  { day: "Fri", deliveries: 40 },
  { day: "Sat", deliveries: 30 },
];

const PIE_DATA = [
  { name: "Express",   value: 40, color: BRAND },
  { name: "Standard",  value: 35, color: "#FFA07A" },
  { name: "Scheduled", value: 25, color: "#FFD4C8" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Completed:   { bg: "#DCFCE7", text: "#16A34A", dot: "#22C55E" },
  "In Transit":{ bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  Pending:     { bg: "#FEF9C3", text: "#A16207", dot: "#EAB308" },
  Cancelled:   { bg: "#FEE2E2", text: "#DC2626", dot: "#EF4444" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Stat card */
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  loading,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  loading: boolean;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "22px 24px",
        border: "1px solid #F0F0F0",
        flex: 1,
        minWidth: 0,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} strokeWidth={1.8} />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 999,
            background: trend === "up" ? "#DCFCE7" : trend === "down" ? "#FEE2E2" : "#F3F4F6",
            color: trend === "up" ? "#16A34A" : trend === "down" ? "#DC2626" : "#6B7280",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {trendLabel}
        </span>
      </div>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 4, fontWeight: 500 }}>{label}</p>
      {loading ? (
        <div style={{ height: 36, width: "60%", borderRadius: 8, background: "#F5F5F5", animation: "pulse 1.5s ease infinite" }} />
      ) : (
        <p style={{ fontSize: 30, fontWeight: 800, color: "#111", letterSpacing: -1, margin: 0 }}>
          {value}
        </p>
      )}
    </div>
  );
}

/** Status badge */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["Pending"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.text,
        fontWeight: 600,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

/** Recent deliveries table */
function DataTable({
  rows,
  loading,
  error,
  onRefresh,
}: {
  rows: Delivery[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const COLS = ["ID", "User", "Transporter", "Amount", "Status", "Action"];
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      {/* Table header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F5F5F5" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Recent Delivery Activity</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#AAA" }}>Latest 5 orders from Firestore</p>
        </div>
        <button
          onClick={onRefresh}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${BRAND}`, borderRadius: 8, background: "transparent", color: BRAND, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "#FEF2F2", borderBottom: "1px solid #FECACA", color: "#DC2626", fontSize: 13 }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              {COLS.map((col) => (
                <th key={col} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((_, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #F5F5F5" }}>
                    {COLS.map((c, j) => (
                      <td key={j} style={{ padding: "14px 20px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "#F0F0F0", width: j === 0 ? 60 : j === 3 ? 70 : "80%", animation: "pulse 1.5s ease infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#AAA", fontSize: 14 }}>
                      No deliveries found in Firestore.
                    </td>
                  </tr>
                )
              : rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderTop: "1px solid #F5F5F5", transition: "background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#555", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      #{row.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}, #ff9575)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {(row.userName ?? "U")[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#222", whiteSpace: "nowrap" }}>{row.userName ?? "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>{row.transporter ?? "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>
                      ${(row.amount ?? 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <StatusBadge status={row.status ?? "Pending"} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #E5E5E5", background: "transparent", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}
                        onClick={() => alert(`Viewing delivery ${row.id}`)}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Custom tooltip for Bar chart */
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#111", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: "2px 0 0", color: BRAND, fontWeight: 600 }}>{payload[0].value} deliveries</p>
      </div>
    );
  }
  return null;
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalRevenue: 0, activeDrivers: 0, totalUsers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // ── Fetch recent deliveries ──────────────────────────────────────────────
  const fetchDeliveries = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const q = query(collection(db, "deliveries"), orderBy("createdAt", "desc"), limit(5));
      const snap = await getDocs(q);
      const rows: Delivery[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Delivery, "id">),
      }));
      setDeliveries(rows);
    } catch (err) {
      console.error("fetchDeliveries:", err);
      setTableError("Could not load deliveries. Check Firestore rules or collection name.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  // ── Fetch stat aggregates ────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [deliverySnap, userSnap, transporterSnap, allDeliveriesSnap] = await Promise.all([
        getCountFromServer(collection(db, "deliveries")),
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "transporter")),
        getDocs(collection(db, "deliveries")),
      ]);
      const totalRevenue = allDeliveriesSnap.docs.reduce(
        (sum, doc) => sum + (Number((doc.data() as Delivery).amount) || 0),
        0
      );
      setStats({
        totalOrders: deliverySnap.data().count,
        totalRevenue,
        activeDrivers: transporterSnap.data().count,
        totalUsers: userSnap.data().count,
      });
    } catch (err) {
      console.error("fetchStats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, [fetchDeliveries, fetchStats]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #F7F8FA; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 99px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

        {/* ── Sidebar ── */}
        <Sidebar />

        {/* ── Main content (scrollable) ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px 48px", minWidth: 0 }}>

          {/* ── Page heading ── */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>
              Welcome back, Admin 
            </h1>
            <p style={{ fontSize: 13, color: "#AAA", marginTop: 4 }}>
              Here's what's happening with SmartMove today.
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <section aria-label="Statistics" style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              trend="up"
              trendLabel="+8% last month"
              loading={statsLoading}
              color={BRAND}
            />
            <StatCard
              icon={CircleDollarSign}
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend="up"
              trendLabel="+12% last month"
              loading={statsLoading}
              color="#10B981"
            />
            <StatCard
              icon={Truck}
              label="Active Drivers"
              value={stats.activeDrivers.toLocaleString()}
              trend="neutral"
              trendLabel="Updated now"
              loading={statsLoading}
              color="#3B82F6"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              trend="up"
              trendLabel="+3% this week"
              loading={statsLoading}
              color="#8B5CF6"
            />
          </section>

          {/* ── Charts Row ── */}
          <section aria-label="Charts" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, marginBottom: 28 }}>

            {/* Pie chart — Delivery Category */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Delivery Category</h3>
              <p style={{ fontSize: 12, color: "#AAA", marginBottom: 20 }}>Breakdown by service type</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: 13 }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {PIE_DATA.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: 13, color: "#555" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart — Weekly Activity */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Weekly Activity</h3>
                  <p style={{ fontSize: 12, color: "#AAA" }}>Deliveries completed per day</p>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: `rgba(255,107,74,0.10)`, color: BRAND, fontSize: 12, fontWeight: 600 }}>
                  This Week
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WEEKLY_DATA} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#AAA" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#AAA" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,107,74,0.06)", rx: 6 }} />
                  <Bar dataKey="deliveries" fill={BRAND} radius={[6, 6, 0, 0]}>
                    {WEEKLY_DATA.map((_, i) => (
                      <Cell key={i} fill={i === 5 ? BRAND : `${BRAND}80`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── Data Table ── */}
          <DataTable
            rows={deliveries}
            loading={tableLoading}
            error={tableError}
            onRefresh={fetchDeliveries}
          />
        </main>
      </div>
    </>
  );
}
