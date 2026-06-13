import { useEffect } from 'react';
import { usePerformanceStore } from '../store/usePerformanceStore';
import { Users, Truck, AlertCircle, Award } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// ─── Formatting Helper ────────────────────────────────────────────────────────
function formatTimestamp(ts: any): string {
  if (!ts) return "—";
  
  let date: Date | null = null;
  if (ts instanceof Timestamp) {
    date = ts.toDate();
  } else if (typeof ts.toDate === "function") {
    date = ts.toDate();
  } else if (ts.seconds !== undefined) {
    date = new Date(ts.seconds * 1000);
  } else if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === "string" || typeof ts === "number") {
    date = new Date(ts);
  }
  
  if (!date || isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DriverPerformance() {
  const { drivers, loading, error, refresh } = usePerformanceStore();

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sort drivers by total deliveries descending
  const sortedDrivers = [...drivers].sort((a, b) => b.totalDeliveries - a.totalDeliveries);

  // Top driver metric
  const topDriver = sortedDrivers.length > 0 ? sortedDrivers[0] : null;
  const totalCompletedDeliveries = drivers.reduce((sum, d) => sum + d.totalDeliveries, 0);

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Driver Performance</h1>
        <p style={styles.subtitle}>
          Analyze and track driver metrics, registration details, and total deliveries
        </p>
      </div>

      {/* Mini Stat Cards for premium design */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, backgroundColor: 'rgba(255, 107, 74, 0.1)', color: '#FF6B4A' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={styles.statLabel}>Active Drivers</span>
            <h3 style={styles.statValue}>{loading ? '—' : drivers.length}</h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
            <Truck size={20} />
          </div>
          <div>
            <span style={styles.statLabel}>Total Deliveries Completed</span>
            <h3 style={styles.statValue}>{loading ? '—' : totalCompletedDeliveries}</h3>
          </div>
        </div>

        {topDriver && topDriver.totalDeliveries > 0 && (
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
              <Award size={20} />
            </div>
            <div>
              <span style={styles.statLabel}>Top Performer</span>
              <h3 style={styles.statValue}>
                {topDriver.fullname ?? topDriver.fullName ?? '—'}
                <span style={styles.topPerformerSub}> ({topDriver.totalDeliveries} deliveries)</span>
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
        </div>
      ) : sortedDrivers.length > 0 ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Driver Name</th>
                <th style={styles.tableHeader}>Phone Number</th>
                <th style={styles.tableHeader}>Joined Date</th>
                <th style={{ ...styles.tableHeader, textAlign: 'right' }}>Total Deliveries</th>
              </tr>
            </thead>
            <tbody>
              {sortedDrivers.map((driver) => {
                return (
                  <tr key={driver.id} style={styles.tableRow}>
                    {/* Driver Name Column */}
                    <td style={styles.tableCell}>
                      <div style={styles.driverProfileCell}>
                        <div style={styles.avatarContainer}>
                          {driver.photoURL || driver.photoUrl ? (
                            <img
                              src={driver.photoURL || driver.photoUrl}
                              style={styles.avatarImg}
                              alt={driver.fullname || driver.fullName || 'Driver'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Users size={18} color="#FF6B4A" />
                          )}
                        </div>
                        <div style={styles.driverNameContainer}>
                          <span style={styles.driverNameText}>
                            {driver.fullname ?? driver.fullName ?? '—'}
                          </span>
                          {/* {isTop && (
                            <span style={styles.topBadge}>
                              <TrendingUp size={10} style={{ marginRight: '3px' }} />
                              Top Driver
                            </span>
                          )} */}
                        </div>
                      </div>
                    </td>

                    {/* Phone Number Column */}
                    <td style={styles.tableCell}>
                      <span style={styles.phoneText}>
                        {driver.phone_number ?? driver.phoneNumber ?? '—'}
                      </span>
                    </td>

                    {/* Joined Date Column */}
                    <td style={styles.tableCell}>
                      <span style={styles.joinedDateText}>
                        {formatTimestamp(driver.createdAt)}
                      </span>
                    </td>

                    {/* Total Deliveries Column */}
                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                      <span style={styles.deliveriesCountText}>
                        {driver.totalDeliveries}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Truck size={48} color="#DDD" />
          </div>
          <p>No driver performance metrics found</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '32px',
    backgroundColor: '#F7F8FA',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#111',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#AAA',
  },
  statsContainer: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex' as const,
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
    border: '1px solid #F0F0F0',
  },
  statIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    fontWeight: 500,
    display: 'block',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111',
    margin: 0,
  },
  topPerformerSub: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex' as const,
    alignItems: 'center',
    gap: '12px',
    color: '#DC2626',
  },
  loadingContainer: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #FF6B4A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  tableHeader: {
    padding: '16px 20px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: 700,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#555',
    verticalAlign: 'middle',
  },
  driverProfileCell: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: '12px',
  },
  avatarContainer: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#FFE4E1',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  driverNameContainer: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '2px',
  },
  driverNameText: {
    fontWeight: 600,
    color: '#111',
  },
  topBadge: {
    display: 'inline-flex' as const,
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 74, 0.1)',
    color: '#FF6B4A',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '20px',
    marginTop: '2px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
  },
  phoneText: {
    color: '#555',
    fontFamily: 'monospace',
  },
  joinedDateText: {
    color: '#666',
  },
  deliveriesCountText: {
    fontWeight: 700,
    color: '#111',
    fontSize: '15px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 20px',
    color: '#999',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
};
