import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Truck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

interface DeliveryRow {
  docId: string;
  deliveryId: string;
  customer: string;
  destination: string;
  status: "Pending" | "Pick up" | "In Transit" | "Delivered" | "Cancelled" | "Delayed" | "Unknown";
  eta: string;
  driver: string;
  paymentStatus: string;
  packageSize: string;
}

const BRAND = "#FF6B4A";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FEF9C3", text: "#92400E" },
  "Pick up": { bg: "#DBEAFE", text: "#1D4ED8" },
  "In Transit": { bg: "#DBEAFE", text: "#1D4ED8" },
  Delivered: { bg: "#DCFCE7", text: "#166534" },
  Cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
  Delayed: { bg: "#FEE2E2", text: "#B91C1C" },
  Unknown: { bg: "#E2E8F0", text: "#475569" },
};

const DELIVERY_TABS = ["All", "Pending", "Pick up", "In Transit", "Delivered", "Cancelled"] as const;

function normalizeStatus(rawStatus: string | null | undefined) {
  const value = rawStatus?.toString().trim().toLowerCase();
  if ( value === "picked_up") return "Pick up";
  if (value === "in_transit") return "In Transit";
  if (value === "delivered") return "Delivered";
  if (value === "cancelled") return "Cancelled";
  if (value === "pending") return "Pending";
  return "Unknown";
}

function formatTimestamp(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return "—";
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof DELIVERY_TABS)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");

  useEffect(() => {
    async function loadDeliveries() {
      setLoading(true);
      setError(null);

      try {
        const transportersRef = collection(db, "transporter");
        const transportersSnapshot = await getDocs(transportersRef);
        const transporterMap = new Map<string, string>();

        transportersSnapshot.docs.forEach((doc) => {
          const data = doc.data() as Record<string, any>;
          const name = data.fullname || data.fullName || data.email || "Transporter";
          transporterMap.set(doc.id, name);
        });

        const deliveriesRef = collection(db, "deliveries");
        const q = query(deliveriesRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const rows = snapshot.docs.map((doc) => {
          const data = doc.data() as Record<string, any>;
          const createdAt = data.createdAt ?? data.updatedAt;
          const status = normalizeStatus(data.status);
          const transporterId = data.transporter ?? data.transporterId ?? data.transporter_id;
          const driverName = transporterId && typeof transporterId === "string" && transporterMap.has(transporterId)
            ? transporterMap.get(transporterId)!
            : data.driver ?? "Unassigned";

          return {
            docId: doc.id,
            deliveryId: data.delivery_id ?? doc.id,
            customer: data.recipientName ?? data.packageName ?? "Unknown",
            destination: data.dropoff?.address ?? "Unknown",
            status,
            eta: formatTimestamp(createdAt),
            driver: driverName,
            paymentStatus: data.paymentStatus ?? "unknown",
            packageSize: data.packageSize ?? "Unknown",
          } as DeliveryRow;
        });

        setDeliveries(rows);
      } catch (err) {
        setError(
          err instanceof Error ? `Unable to load deliveries: ${err.message}` : "Unable to load deliveries."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((row) => {
      const matchesTab = activeTab === "All" || row.status === activeTab;
      const matchesPayment = paymentFilter === "All" || row.paymentStatus === paymentFilter;
      const matchesSize = sizeFilter === "All" || row.packageSize === sizeFilter;
      return matchesTab && matchesPayment && matchesSize;
    });
  }, [activeTab, deliveries, paymentFilter, sizeFilter]);

  const total = deliveries.length;
  const inTransit = deliveries.filter((row) => row.status === "In Transit").length;
  const delivered = deliveries.filter((row) => row.status === "Delivered").length;
  const cancelled = deliveries.filter((row) => row.status === "Cancelled").length;
  const pending = deliveries.filter((row) => row.status === "Pending").length;
  const pickup = deliveries.filter((row) => row.status === "Pick up").length;

  const summaryCards = [
    { label: "Total Deliveries", value: total, note: `${total > 0 ? "Total" : "Loading..."}`, icon: Truck, color: "#FF6B4A" },
    { label: "Pending", value: pending, note: "Total", icon: Clock3, color: "#F59E0B" },
    { label: "Pick up", value: pickup, note: "Total", icon: Clock3, color: "#0B69FF" },
    { label: "In Transit", value: inTransit, note: "Total", icon: Clock3, color: "#0B69FF" },
    { label: "Delivered", value: delivered, note: "Total", icon: CheckCircle2, color: "#16A34A" },
    { label: "Cancelled", value: cancelled, note: "Total", icon: AlertTriangle, color: "#F97316" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Delivery dashboard</h1>
          <p style={styles.pageDescription}>
            Track all active shipments, delivery status, and estimated arrival times.
          </p>
        </div>
      </div>

      <div style={styles.cardGrid}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={styles.summaryCard}>
              <div style={{ ...styles.summaryIcon, background: `${card.color}1A`, color: card.color }}>
                <Icon size={18} />
              </div>
              <div>
                <p style={styles.summaryLabel}>{card.label}</p>
                <p style={styles.summaryValue}>{loading ? "—" : card.value}</p>
                <p style={styles.summaryNote}>{card.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.tablePanel}>
        <div style={styles.tablePanelHeader}>
          <div style={styles.tabs}>
            {DELIVERY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? styles.tabActive : styles.tab}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={styles.tablePanelActions}>
            <button style={styles.filterButton}>
              <CalendarDays size={14} />
              Last 30 Days
            </button>
            <button style={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)}>
              <ChevronRight size={14} />
              More Filters
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div style={styles.filterPanel}>
            <div style={styles.filterRow}>
              <label style={styles.filterLabel}>
                Payment status
                <select style={styles.filterSelect} value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
                  <option value="All">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </label>
              <label style={styles.filterLabel}>
                Package size
                <select style={styles.filterSelect} value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
                  <option value="All">All</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Driver</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} style={styles.tr}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} style={styles.td}>
                        <div style={styles.skeletonCell} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    No deliveries found for this filter.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((row) => (
                  <tr key={row.docId} style={styles.tr}>
                    <td style={styles.tdId}>{row.deliveryId}</td>
                    <td style={styles.td}>{row.customer}</td>
                    <td style={styles.td}>{row.destination}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: STATUS_STYLES[row.status].bg, color: STATUS_STYLES[row.status].text }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={styles.td}>{row.eta}</td>
                    <td style={styles.td}>{row.driver}</td>
                    <td style={styles.tdAction}>
                      <button type="button" style={styles.actionButton}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    minHeight: "100vh",
    padding: "32px",
    backgroundColor: "#F7F8FA",
    fontFamily: "'Inter', sans-serif",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap" as const,
    alignItems: "flex-start",
  },
  pageLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "#FF6B4A",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  },
  pageTitle: {
    margin: "10px 0 8px",
    fontSize: '22px',
    fontWeight: 800,
    color: "#111827",
  },
  pageDescription: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#64748B",
    maxWidth: 560,
  },
  headerActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    borderRadius: 14,
    background: BRAND,
    color: "#fff",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 20,
    marginTop: 24,
  },
  summaryCard: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    background: "#fff",
    border: "1px solid #F2F4F7",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
  },
  summaryLabel: {
    margin: 0,
    fontSize: 13,
    color: "#64748B",
    fontWeight: 600,
  },
  summaryValue: {
    margin: "8px 0 6px",
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
  },
  summaryNote: {
    margin: 0,
    fontSize: 13,
    color: "#94A3B8",
  },
  tablePanel: {
    marginTop: 24,
    background: "#fff",
    padding: 24,
    borderRadius: 24,
    border: "1px solid #F2F4F7",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  tablePanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap" as const,
    alignItems: "center",
    marginBottom: 20,
  },
  tabs: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  tab: {
    padding: "10px 18px",
    borderRadius: 999,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  tabActive: {
    padding: "10px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255, 107, 74, 0.2)",
    background: "rgba(255, 107, 74, 0.1)",
    color: BRAND,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  tablePanelActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  filterButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  filterPanel: {
    marginBottom: 20,
    padding: "20px",
    borderRadius: 20,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
  },
  filterRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  filterLabel: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    fontSize: 13,
    color: "#475569",
    fontWeight: 600,
  },
  filterSelect: {
    marginTop: 6,
    minWidth: 180,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    background: "#fff",
    color: "#0F172A",
    fontSize: 13,
  },
  errorBanner: {
    marginBottom: 20,
    padding: "14px 18px",
    borderRadius: 16,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#B91C1C",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 860,
  },
  th: {
    textAlign: "left" as const,
    padding: "16px 18px",
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#64748B",
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap" as const,
  },
  tr: {
    borderBottom: "1px solid #F1F5F9",
  },
  td: {
    padding: "16px 18px",
    fontSize: 14,
    color: "#0F172A",
    verticalAlign: "middle" as const,
  },
  tdId: {
    padding: "16px 18px",
    fontSize: 14,
    color: "#111827",
    fontWeight: 700,
    verticalAlign: "middle" as const,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    minWidth: 96,
  },
  actionButton: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  tdAction: {
    padding: "16px 18px",
    verticalAlign: "middle" as const,
  },
  skeletonCell: {
    width: "100%",
    height: 14,
    borderRadius: 8,
    background: "#F3F4F6",
  },
  emptyState: {
    padding: "40px 18px",
    textAlign: "center" as const,
    color: "#64748B",
    fontSize: 14,
  },
};
