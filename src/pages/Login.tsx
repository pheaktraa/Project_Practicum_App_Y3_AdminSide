import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
import { auth } from "../firebase";

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Login failed. Please try again.";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage((err as { code: string }).code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>

      {/* Ambient glow orbs */}
      <div style={{ position: "absolute", top: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,74,0.18) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,74,0.14) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 32px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)" }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, #FF6B4A, #ff3d1a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(255,107,74,0.45)" }}>
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: -0.5 }}>
            Smart<span style={{ color: "#FF6B4A" }}>Move</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: "1.75rem" }}>Sign in to your admin account.</p>

        {/* Error */}
        {error && (
          <div role="alert" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,59,59,0.12)", border: "1px solid rgba(255,59,59,0.3)", color: "#ff7070", fontSize: 13, marginBottom: "1.25rem" }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {/* Email */}
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 14px 12px 40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "rgba(255,107,74,0.55)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,74,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 44px 12px 40px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "rgba(255,107,74,0.55)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,74,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", padding: 2 }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right" }}>
            <a href="#" style={{ fontSize: 12, color: "#FF6B4A", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
          </div>

          {/* Submit */}
          <button id="login-submit-btn" type="submit" disabled={loading} aria-busy={loading}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #FF6B4A, #ff3d1a)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", boxShadow: "0 6px 24px rgba(255,107,74,0.38)", marginTop: 4 }}>
            {loading
              ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Signing in…</>
              : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "1.75rem", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Restricted to <strong style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>authorized administrators</strong> only.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
    </div>
  );
}
