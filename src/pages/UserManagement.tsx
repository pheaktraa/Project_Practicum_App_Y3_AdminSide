import { useEffect, useState } from 'react'; 
import { Users, UserCheck, AlertCircle } from 'lucide-react';
import { useGetAllUsers } from '../store/authStore';

export default function UserManagement() {
  const { customers, drivers, loading, error, fetch } = useGetAllUsers();
  const [activeTab, setActiveTab] = useState<'customers' | 'drivers'>('customers');

   useEffect(() => {
    fetch();
  }, [fetch]);

  const currentUsers = activeTab === 'customers' ? customers : drivers;

return (
  <div style={styles.container}>
    
    {/* Header */}
    <div style={styles.header}>
      <h1 style={styles.title}>User Management</h1>
      <p style={styles.subtitle}>
        Manage customers and drivers in your system
      </p>
    </div>

    {/* Tabs */}
    <div style={styles.tabsContainer}>
      <button
        style={styles.tab(activeTab === 'customers')}
        onClick={() => setActiveTab('customers')}
      >
        <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
        Customers ({customers.length})
      </button>
      <button
        style={styles.tab(activeTab === 'drivers')}
        onClick={() => setActiveTab('drivers')}
      >
        <UserCheck size={16} style={{ display: 'inline', marginRight: '8px' }} />
        Drivers ({drivers.length})
      </button>
    </div>

    {/* Error State */}
    {error && (
      <div style={{
        backgroundColor: '#FEE2E2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#DC2626',
      }}>
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    )}

    {/* Loading State */}
    {loading ? (
      <div style={styles.loadingContainer}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #FF6B4A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    ) : currentUsers.length > 0 ? (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Full Name</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Phone Number</th>
              <th style={styles.tableHeader}>Role</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.userAvatar}>
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          style={styles.avatarImg}
                          alt={user.fullname}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'; // Fallback to empty src
                          }}
                        />
                      ) : (
                        <Users size={20} color="#FF6B4A" />
                      )}
                    </div>
                    <span style={{ fontWeight: 500, color: '#111' }}>{user.fullname}</span>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{ color: '#666' }}>{user.email}</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{ color: '#666' }}>{user.phone_number}</span>
                </td>
                <td style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.roleBadge,
                      ...(user.roles === 'transporter' ? styles.roleBadgeDriver : styles.roleBadgeCustomer),
                    }}
                  >
                    {user.roles === 'user' ? 'Customer' : 'Driver'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          {activeTab === 'customers' ? (
            <Users size={48} color="#DDD" />
          ) : (
            <UserCheck size={48} color="#DDD" />
          )}
        </div>
        <p>No {activeTab} found</p>
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
  tabsContainer: {
    display: 'flex' as const,
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid #E5E7EB',
  },
  tab: (isActive: boolean) => ({
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: isActive ? '#FF6B4A' : '#999',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #FF6B4A' : '2px solid transparent',
    transition: 'all 0.2s',
  }),
  tabContent: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  userCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s',
  },
  userCardHover: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
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
  userName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111',
    marginBottom: '6px',
  },
  userEmail: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize' as const,
  },
  roleBadgeCustomer: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  roleBadgeDriver: {
    backgroundColor: '#F3E5F5',
    color: '#7B1FA2',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 20px',
    color: '#999',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
  loadingContainer: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#999',
  },
  tableWrapper: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    background: '#F9FAFB',
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
    transition: 'background 0.15s',
  },
  tableCell: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#555',
  },
};
