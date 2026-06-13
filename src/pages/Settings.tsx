import { useState, useEffect } from "react";
import { useGetAdminById } from "../store/authStore";
import { User, Mail, Check, X, Camera } from "lucide-react";

export default function Settings() {
  const { admin, loading, error, fetch, updateAdmin } = useGetAdminById();

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
    const success = await updateAdmin({
      fullname: formData.fullname,
      email: formData.email,
    });
    if (success) {
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
  };

  const handleCameraClick = async () => {
    const currentUrl = admin?.photoURL || "";
    const newImageUrl = window.prompt(
      "Enter the image URL (e.g., https://example.com/photo.jpg):",
      currentUrl
    );
    if (newImageUrl !== null && newImageUrl.trim() !== "") {
      const success = await updateAdmin({ photoURL: newImageUrl.trim() });
      if (success) {
        alert("Profile picture updated!");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-[3px] border-[#E5E7EB] border-t-[#FF6B4A] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-[#F7F8FA] font-sans">
        <div className="bg-[#FFF5F5] text-[#C53030] p-6 rounded-xl text-center border border-[#FEB2B2] max-w-md">
          <p className="mb-4">Error loading settings: {error}</p>
          <button
            onClick={() => fetch()}
            className="bg-white text-[#111] py-2 px-5 rounded-lg border border-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 32px 48px', minWidth: 0, background: '#F7F8FA', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page heading ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.5, marginBottom: 4 }}>
          Account Settings
        </h1>
        <p style={{ fontSize: 13, color: '#AAA' }}>
          Manage and customize your profile information.
        </p>
      </div>

      {/* ── ID Card ── */}
      <div className="bg-white w-full max-w-4xl rounded-[20px] p-8 shadow-[0_10px_25px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-12 items-start">

        {/* ── Left Column: Avatar ── */}
        <div className="flex flex-col items-center shrink-0 self-center md:self-start">
          <div className="relative">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-[#FFF0F0] flex items-center justify-center overflow-hidden border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              {admin?.photoURL ? (
                <img
                  src={admin.photoURL}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-[#FF6B6B]" />
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 bg-[#111] text-white rounded-full w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors shadow-md"
              onClick={handleCameraClick}
              title="Update profile photo"
            >
              <Camera size={18} />
            </button>
          </div>
        </div>

        {/* ── Right Column: Info & Inputs ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Name & Role */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>
              {admin?.fullname}
            </h2>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
              {admin?.roles?.toUpperCase()}
            </p>
          </div>

          {/* ── Input Fields ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Full Name */}
            <div
              className="flex flex-col gap-2 group"
              onClick={() => !isEditing && setIsEditing(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <User size={14} color={isEditing ? '#FF6B4A' : '#888'} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Full Name
                </span>
              </div>
              {isEditing ? (
                <input
                  autoFocus
                  style={{ width: '100%', padding: '14px 16px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 15, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                  className="focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent transition-all"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  onFocus={(e) => { e.target.style.borderColor = '#FF6B4A'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div
                  style={{ fontSize: 15, color: '#111', padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, border: '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.background = '#F3F4F6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                >
                  {formData.fullname || 'Not set'}
                </div>
              )}
            </div>

            {/* Email */}
            <div
              className="flex flex-col gap-2 group"
              onClick={() => !isEditing && setIsEditing(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Mail size={14} color={isEditing ? '#FF6B4A' : '#888'} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Email Address
                </span>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  style={{ width: '100%', padding: '14px 16px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 15, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={(e) => { e.target.style.borderColor = '#FF6B4A'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div
                  style={{ fontSize: 15, color: '#111', padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, border: '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.background = '#F3F4F6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                >
                  {formData.email || 'Not set'}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer: Buttons or Hint ── */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: isEditing ? 'flex-end' : 'center', alignItems: 'center' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleCancel}
                  style={{ padding: '12px 28px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{ padding: '12px 28px', background: '#FF6B4A', color: '#FFF', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(255,107,74,0.35)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e55a3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6B4A')}
                >
                  <Check size={15} /> Save Changes
                </button>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#AAA', margin: 0 }}>
                Click on any field above to edit
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
