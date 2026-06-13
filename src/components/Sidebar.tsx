import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  LayoutDashboard,
  Users,
  Truck,
  PackageSearch,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND = "#FF6B4A";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users,           label: "User Management", path: "/users" },
  { icon: Truck,           label: "Driver Performance", path: "/performance" },
  { icon: PackageSearch,   label: "Deliveries", path: "/deliveries" },
  // { icon: BarChart3,       label: "Analytics", path: "/analytics" },
  { icon: Settings,        label: "Settings", path: "/settings" },
];

// ─── Sidebar Component ────────────────────────────────────────────────────────
export default function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #F0F0F0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 20,
      }}
    >
      {/* ── Brand / Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "24px 20px",
          borderBottom: "1px solid #F5F5F5",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND}, #ff3d1a)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 4px 14px rgba(255,107,74,0.4)`,
          }}
        >
          <Zap size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: "#111",
            letterSpacing: -0.5,
          }}
        >
          Smart<span style={{ color: BRAND }}>Move</span>
        </span>
      </div>

      {/* ── Nav section label ── */}
      <p
        style={{
          padding: "20px 20px 8px",
          fontSize: 10,
          fontWeight: 700,
          color: "#AAA",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Main Menu
      </p>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            style={({ isActive }) => ({
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 10,
              textDecoration: "none",
              background: isActive ? `rgba(255,107,74,0.10)` : "transparent",
              color: isActive ? BRAND : "#666",
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              marginBottom: 2,
              transition: "all 0.15s",
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.classList.contains("active")) {
                el.style.background = "#F9F9F9";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.classList.contains("active")) {
                el.style.background = "transparent";
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ flexShrink: 0 }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: "16px 10px 24px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "#EF4444",
            fontWeight: 500,
            fontSize: 14,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
          }
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
