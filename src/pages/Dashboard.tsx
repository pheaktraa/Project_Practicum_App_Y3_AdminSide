import { useDeliveryStore } from "../store/useDeliveryStore";
import {
  Users,
  Truck,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import PackageSizeChart from "../components/analytics/PackageSizeChart";
import WeeklyActivityChart from "../components/analytics/WeeklyActivityChart";
import RecentDeliveriesTable from "../components/dashboard/RecentDeliveriesTable";


// ─── Types ───────────────────────────────────────────────────────────────────
// ─── Constants ───────────────────────────────────────────────────────────────
const BRAND = "#FF6B4A";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Stat card */
function StatCard({
  icon: Icon,
  label,
  value,
  trend = "neutral",
  trendLabel = "",
  loading,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    totalRevenue,
    recentDeliveries,
    totalOrders,
    activeDrivers,
    totalUsers,
    packageSizeStats,
    weeklyStats,
    loading,
    error,
    refresh,
  } = useDeliveryStore();

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

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
              value={totalOrders.toLocaleString()}
              // trend="up"
              // trendLabel="+8% last month"
              loading={loading}
              color={BRAND}
            />
            <StatCard
              icon={CircleDollarSign}
              label="Total Revenue"
              value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              // trend="up"
              // trendLabel="+12% last month"
              loading={loading}
              color="#10B981"
            />
            <StatCard
              icon={Truck}
              label="Active Drivers"
              value={activeDrivers.toLocaleString()}
              // trend="neutral"
              // trendLabel="Updated now"
              loading={loading}
              color="#3B82F6"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={totalUsers.toLocaleString()}
              // trend="up"
              // trendLabel="+3% this week"
              loading={loading}
              color="#8B5CF6"
            />
          </section>

          {/* ── Charts Row ── */}
          <section aria-label="Charts" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, marginBottom: 28 }}>

            <PackageSizeChart data={packageSizeStats} />
            <WeeklyActivityChart data={weeklyStats} />
          </section>

          {/* ── Data Table ── */}
          <RecentDeliveriesTable
            deliveries={recentDeliveries}
            onRefresh={refresh}
            loading={loading}
            error={error}
          />
        </main>
      </div>
    </>
  );
}
