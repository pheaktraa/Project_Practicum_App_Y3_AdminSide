import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { type Delivery } from "../../store/useDeliveryStore";

const BRAND = "#FF6B4A";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Completed:   { bg: "#DCFCE7", text: "#16A34A", dot: "#22C55E" },
  "In Transit":{ bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  Pending:     { bg: "#FEF9C3", text: "#A16207", dot: "#EAB308" },
  Cancelled:   { bg: "#FEE2E2", text: "#DC2626", dot: "#EF4444" },
};

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

interface RecentDeliveriesTableProps {
  deliveries: Delivery[];
  onRefresh: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

export default function RecentDeliveriesTable({ deliveries, onRefresh, loading = false, error = null }: RecentDeliveriesTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const COLS = ["ID", "User", "Transporter", "Amount", "Status", "Action"];
  const COLS = ["ID", "User", "Transporter", "Amount", "Status"];
  const skeletonRows = Array.from({ length: 5 });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error("Error refreshing deliveries:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const showLoading = loading || isRefreshing;


  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      {/* Table header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F5F5F5" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Recent Delivery Activity</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#AAA" }}>Latest 5 orders from Firestore</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${BRAND}`, borderRadius: 8, background: "transparent", color: BRAND, fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: isRefreshing ? 0.7 : 1 }}
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
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
            {showLoading
              ? skeletonRows.map((_, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #F5F5F5" }}>
                    {COLS.map((_, j) => (
                      <td key={j} style={{ padding: "14px 20px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "#F0F0F0", width: j === 0 ? 60 : j === 3 ? 70 : "80%", animation: "pulse 1.5s ease infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#AAA", fontSize: 14 }}>
                      No deliveries found in Firestore.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((row) => {
                    const userName = row.senderName ?? row.recipientName ?? "Customer";
                    const priceVal = row.price !== undefined ? Number(row.price) : 0;

                return (
                  <tr
                    key={row.id}
                    style={{ borderTop: "1px solid #F5F5F5", transition: "background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#555", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      #{row.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}, #ff9575)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {userName[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#222", whiteSpace: "nowrap" }}>{userName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {row.transporterName ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: `linear-gradient(135deg, ${BRAND}, #ff9575)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 12,
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {row.transporterPhoto ? (
                              <img
                                src={row.transporterPhoto}
                                alt={row.transporterName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              row.transporterName[0].toUpperCase()
                            )}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#222", whiteSpace: "nowrap" }}>
                            {row.transporterName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: "#888" }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>
                      ${priceVal.toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <StatusBadge status={row.status ?? "Pending"} />
                    </td>
                    {/* <td style={{ padding: "14px 20px" }}>
                      <button
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #E5E5E5", background: "transparent", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}
                        onClick={() => alert('Viewing details for Delivery ID: ' + row.id)}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td> */}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
