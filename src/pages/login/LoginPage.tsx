// login.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // ── Step 1: Sign in ──────────────────────────────────────────
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (isMounted.current) {
          setDebugInfo(
            `AUTH ERROR → code: ${authError.status} | message: ${authError.message}`,
          );
          setError("Invalid email or password.");
          setLoading(false);
        }
        return;
      }

      if (!authData?.user) {
        if (isMounted.current) {
          setDebugInfo(
            "AUTH ERROR → signInWithPassword returned no user and no error.",
          );
          setError("No user returned. Please try again.");
          setLoading(false);
        }
        return;
      }

      // if (isMounted.current) {
      //   setDebugInfo(
      //     `AUTH OK → user id: ${authData.user.id} | email: ${authData.user.email}`,
      //   );
      // }

      // ── Step 2: Check profiles table ────────────────────────────
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        if (isMounted.current) {
          setDebugInfo(
            (prev) =>
              `${prev || ""}\nPROFILE ERROR → code: ${profileError.code} | message: ${profileError.message} | details: ${profileError.details} | hint: ${profileError.hint}`,
          );
          await supabase.auth.signOut();
          setError("Could not verify your account. See debug info below.");
          setLoading(false);
        }
        return;
      }

      if (!profile) {
        if (isMounted.current) {
          setDebugInfo(
            (prev) =>
              `${prev || ""}\nPROFILE ERROR → Query returned null — no row found in profiles for this user id.`,
          );
          await supabase.auth.signOut();
          setError("No profile found for this account.");
          setLoading(false);
        }
        return;
      }

      // if (isMounted.current) {
      //   setDebugInfo(
      //     (prev) => `${prev || ""}\nPROFILE OK → role: ${profile.role}`,
      //   );
      // }

      if (profile.role !== "admin") {
        if (isMounted.current) {
          await supabase.auth.signOut();
          setError("Access denied. Admins only.");
          setLoading(false);
        }
        return;
      }

      // ── Step 3: Success ──────────────────────────────────────────
      // Wait a moment for the auth state to update in AuthContext
       if (isMounted.current) {
        setLoading(false);
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      if (isMounted.current) {
        setDebugInfo(
          `UNEXPECTED ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0d0a0f", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(232,121,249,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(232,121,249,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(192,38,211,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-20 right-1/4 w-2 h-2 rounded-full"
          style={{
            background: "#e879f9",
            boxShadow: "0 0 12px 4px rgba(232,121,249,0.4)",
          }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-1.5 h-1.5 rounded-full"
          style={{
            background: "#f472b6",
            boxShadow: "0 0 10px 3px rgba(244,114,182,0.4)",
          }}
        />
        <div
          className="absolute top-1/3 left-16 w-1 h-1 rounded-full"
          style={{
            background: "#c084fc",
            boxShadow: "0 0 8px 3px rgba(192,132,252,0.4)",
          }}
        />
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full max-w-[420px] rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(26,13,31,0.95) 0%, rgba(20,10,26,0.98) 100%)",
          border: "1px solid rgba(232,121,249,0.15)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.6), 0 0 100px rgba(192,38,211,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Top gradient stripe */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #9333ea 25%, #ec4899 50%, #9333ea 75%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(192,38,211,0.06), transparent)",
          }}
        />

        <div className="px-8 py-10 relative">
          {/* ── Brand ── */}
          <div className="flex flex-col items-center mb-8 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(192,38,211,0.2), rgba(236,72,153,0.1))",
                border: "1px solid rgba(232,121,249,0.2)",
                boxShadow: "0 0 24px rgba(192,38,211,0.15)",
              }}
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9"
              >
                <rect
                  x="3"
                  y="9"
                  width="17"
                  height="13"
                  rx="8"
                  fill="rgba(232,121,249,0.15)"
                  stroke="url(#paddleGrad)"
                  strokeWidth="1.5"
                />
                <rect
                  x="9"
                  y="20"
                  width="5"
                  height="9"
                  rx="2.5"
                  fill="rgba(236,72,153,0.2)"
                  stroke="url(#paddleGrad)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="25"
                  cy="8"
                  r="5"
                  fill="rgba(232,121,249,0.12)"
                  stroke="url(#paddleGrad)"
                  strokeWidth="1.5"
                />
                <circle cx="23.5" cy="7" r="0.9" fill="#e879f9" opacity="0.8" />
                <circle cx="26.5" cy="7" r="0.9" fill="#e879f9" opacity="0.8" />
                <circle cx="25" cy="10" r="0.9" fill="#e879f9" opacity="0.8" />
                <defs>
                  <linearGradient
                    id="paddleGrad"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#e879f9" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <h1
                className="text-white font-bold text-2xl"
                style={{ letterSpacing: "-0.04em" }}
              >
                PicklePro
              </h1>
              <p
                className="text-[11px] font-semibold tracking-[0.22em] uppercase mt-1"
                style={{
                  background: "linear-gradient(90deg, #c084fc, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Admin Portal
              </p>
            </div>
          </div>

          {/* ── Restricted badge ── */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(232,121,249,0.12))",
              }}
            />
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: "rgba(192,38,211,0.08)",
                border: "1px solid rgba(232,121,249,0.12)",
              }}
            >
              <ShieldCheck
                size={10}
                style={{ color: "rgba(232,121,249,0.6)" }}
              />
              <span
                className="text-[9px] font-bold tracking-[0.18em] uppercase"
                style={{ color: "rgba(232,121,249,0.6)" }}
              >
                Restricted Access
              </span>
            </div>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(232,121,249,0.12))",
              }}
            />
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              className="mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertTriangle
                size={14}
                className="shrink-0 mt-0.5"
                style={{ color: "#f87171" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#fca5a5" }}
              >
                {error}
              </p>
            </div>
          )}

          {/* ── Debug info box ── */}
          {debugInfo && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-left"
              style={{
                background: "rgba(234,179,8,0.06)",
                border: "1px solid rgba(234,179,8,0.2)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "rgba(234,179,8,0.7)" }}
              >
                🔍 Debug Info
              </p>
              <pre
                className="text-[10px] leading-relaxed whitespace-pre-wrap break-all"
                style={{
                  color: "rgba(234,179,8,0.6)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {debugInfo}
              </pre>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                style={{ color: "rgba(232,121,249,0.5)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(232,121,249,0.3)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@picklepro.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(10,5,14,0.8)",
                    border: "1px solid rgba(232,121,249,0.1)",
                    color: "white",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(232,121,249,0.4)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(192,38,211,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(232,121,249,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                style={{ color: "rgba(232,121,249,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(232,121,249,0.3)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(10,5,14,0.8)",
                    border: "1px solid rgba(232,121,249,0.1)",
                    color: "white",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(232,121,249,0.4)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(192,38,211,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(232,121,249,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 disabled:opacity-50"
                  style={{ color: "rgba(232,121,249,0.3)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(232,121,249,0.7)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(232,121,249,0.3)")
                  }
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 py-3.5 rounded-xl font-bold text-sm tracking-wider text-white flex items-center justify-center gap-2 overflow-hidden transition-all duration-200 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(147,51,234,0.4)"
                  : "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
                boxShadow: loading
                  ? "none"
                  : "0 4px 24px rgba(147,51,234,0.35), 0 1px 0 rgba(255,255,255,0.08) inset",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {!loading && (
                <span
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, #a855f7 0%, #f472b6 100%)",
                  }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </button>
          </form>

          <p
            className="mt-6 text-center text-[10px] leading-relaxed"
            style={{ color: "rgba(232,121,249,0.18)" }}
          >
            Authorized administrators only.
            <br />
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
