import { useState, useEffect } from "react";
import { useGetAdminById } from "../store/authStore";
import { User, Mail, Check, X, Camera } from "lucide-react";

export default function Settings() {
  const { admin, loading, error, fetch, updateAdmin } = useGetAdminById();

  // Track which field is being edited
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

   useEffect(() => {
    if (admin) {
      setFormData({ fullname: admin.fullname || "", email: admin.email || "" });
    }
  }, [admin]);

  const handleCancel = () => {
    if (admin) {
      setFormData({ fullname: admin.fullname, email: admin.email });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Here you would normally call an update API
    const success = await updateAdmin({
      fullname: formData.fullname,
      email: formData.email
    });

    if (success) {
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
  };

  const handleCameraClick = async () => {
    const currentUrl = admin?.photoURL || "";
    const newImageUrl = window.prompt("Enter the image URL (e.g., https://example.com/photo.jpg):", currentUrl);

    // If the user didn't click cancel and the string isn't empty
    if (newImageUrl !== null && newImageUrl.trim() !== "") {
      const success = await updateAdmin({ photoURL: newImageUrl.trim() });
      if (success) {
        alert("Profile picture updated!");
      }
    }
  };

   if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p>Error loading settings: {error}</p>
          <button onClick={() => fetch()} style={styles.buttonSecondary}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
       {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Account Settings</h1>
          <p style={styles.subtitle}>Manage and customize your profile information.</p>
        </div>
      </header>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          {/* Header / Avatar */}
          <div style={styles.profileHeader}>
            <div style={styles.avatarWrapper}>
              <div style={styles.userAvatar}>
                 {admin?.photoURL ? (
                  <img src={admin.photoURL} alt="Admin" style={styles.avatarImg} />
                ) : (
                  <User size={40} color="#FF6B6B" />
                )}
              </div>

              <button 
                style={styles.cameraBtn}
                onClick={handleCameraClick}
                title="Update image URL"
                >
                  <Camera size={14} />
              </button>
            </div>
            <h2 style={styles.userName}>{admin?.fullname}</h2>
            <p style={styles.userRole}>{admin?.roles?.toUpperCase()}</p>
          </div>

          <div style={styles.infoList}>
            {/* Full Name Field */}
            <div 
              style={styles.infoRow}
              onClick={() => !isEditing && setIsEditing(true)}
            >
              <div style={styles.labelGroup}>
                <User size={16} color={isEditing ? "#0070F3" : "#888"} />
                <span style={styles.fieldLabel}>Full Name</span>
              </div>
              
              {isEditing ? (
                <input 
                  autoFocus
                  style={styles.inlineInput}
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                />
              ) : (
                <div style={styles.clickableValue}>{formData.fullname || "Not set"}</div>
              )}
            </div>

            {/* Email Field */}
            <div 
              style={styles.infoRow}
              onClick={() => !isEditing && setIsEditing(true)}
            >
              <div style={styles.labelGroup}>
                <Mail size={16} color={isEditing ? "#0070F3" : "#888"} />
                <span style={styles.fieldLabel}>Email Address</span>
              </div>
              
              {isEditing ? (
                <input 
                  style={styles.inlineInput}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <div style={styles.clickableValue}>{formData.email || "Not set"}</div>
              )}
            </div>
          </div>

         {/* Dynamic Footer - Only shows when editing */}
        <div style={{...styles.footer, height: isEditing ? '80px' : '40px'}}>
          {isEditing ? (
            <div style={styles.buttonGroup}>
              <button onClick={handleCancel} style={styles.btnCancel}>
                <X size={16} style={{marginRight: '6px'}}/> Cancel
              </button>
              <button onClick={handleSave} style={styles.btnSave}>
                <Check size={16} style={{marginRight: '6px'}}/> Save Changes
              </button>
            </div>
          ) : (
            <p style={styles.footerText}>Click on any information to edit</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    overflowY: 'auto' as const,
    padding: '32px',
    backgroundColor: '#F7F8FA',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: '550px',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
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
  avatarWrapper: {
    position: 'relative' as const,
    marginBottom: '16px',
  },
  userAvatar: {
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    backgroundColor: '#FFF0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '4px solid #FFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  cameraBtn: {
    position: 'absolute' as const,
    bottom: '0',
    right: '0',
    backgroundColor: '#111',
    color: '#FFF',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  userName: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 4px 0',
  },
  userRole: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#999',
    letterSpacing: '1px',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  labelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#888',
  },
  clickableValue: {
    fontSize: '15px',
    color: '#111',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#DDD',
      backgroundColor: '#F3F4F6',
    }
  },
   editActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inlineInput: {
    flex: 1,
    padding: '11px 15px',
    borderRadius: '10px',
    border: '2px solid #0070F3',
    fontSize: '15px',
    outline: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  btnSave: {
    flex: 2,
    backgroundColor: '#111',
    color: '#FFF',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center' as const,
    paddingTop: '20px',
    borderTop: '1px solid #F0F0F0',
  },
  footerText: {
    fontSize: '12px',
    color: '#AAA',
  },
  loadingContainer: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#999',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '12px',
    color: '#999',
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #DDD',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#0070F3',
    }
  },
  buttonPrimary: {
    backgroundColor: '#111',
    color: '#FFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  buttonSecondary: {
    backgroundColor: '#FFF',
    color: '#111',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #DDD',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    color: '#C53030',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '1px solid #FEB2B2',
  }
};