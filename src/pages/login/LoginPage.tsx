//LoginPage.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast"; // Add this import
import PinkleBall from "../../assets/MainLogo/PinkleBall.png";

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

          // Show error toast
          toast.error("Invalid email or password. Please try again.", {
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          });

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

          // Show error toast
          toast.error("Authentication failed. Please try again.", {
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          });

          setLoading(false);
        }
        return;
      }

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

          // Show error toast
          toast.error("Could not verify your account.", {
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          });

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

          // Show error toast
          toast.error("No profile found for this account.", {
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          });

          setLoading(false);
        }
        return;
      }

      if (profile.role !== "admin") {
        if (isMounted.current) {
          await supabase.auth.signOut();
          setError("Access denied. Admins only.");

          // Show error toast
          toast.error("Access denied. Admin privileges required.", {
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          });

          setLoading(false);
        }
        return;
      }

      // ── Step 3: Success ──────────────────────────────────────────
      if (isMounted.current) {
        // Show success toast before navigation
        toast.success("Welcome back! Login successful. 🎉", {
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid rgba(236,72,153,0.2)",
            boxShadow: "0 4px 12px rgba(236,72,153,0.15)",
          },
          iconTheme: {
            primary: "#ec4899",
            secondary: "#fff",
          },
        });

        // Small delay to let the toast be visible before navigation
        setTimeout(() => {
          if (isMounted.current) {
            setLoading(false);
            navigate("/admin", { replace: true });
          }
        }, 500);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      if (isMounted.current) {
        setDebugInfo(
          `UNEXPECTED ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
        setError("An unexpected error occurred. Please try again.");

        // Show error toast
        toast.error("An unexpected error occurred. Please try again.", {
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        });

        setLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-0 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f5f3ff 75%, #ede9fe 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Animated Gradient Bubbles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large bubble top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(244,114,182,0.08) 40%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        {/* Large bubble bottom-left */}
        <div
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full animate-float-delayed"
          style={{
            background:
              "radial-gradient(circle, rgba(192,132,252,0.12) 0%, rgba(167,139,250,0.06) 40%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        {/* Medium bubble center-left */}
        <div
          className="absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(244,114,182,0.1) 0%, rgba(236,72,153,0.04) 40%, transparent 70%)",
            animation: "float 12s ease-in-out infinite",
          }}
        />
        {/* Medium bubble bottom-right */}
        <div
          className="absolute bottom-1/4 -right-24 w-[450px] h-[450px] rounded-full animate-float-delayed-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(216,180,254,0.1) 0%, rgba(192,132,252,0.04) 40%, transparent 70%)",
            animation: "float 14s ease-in-out infinite reverse",
          }}
        />
        {/* Small floating decorative circles */}
        <div
          className="absolute top-20 left-1/4 w-3 h-3 rounded-full"
          style={{
            background: "rgba(236,72,153,0.3)",
            boxShadow: "0 0 20px rgba(236,72,153,0.2)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full"
          style={{
            background: "rgba(192,132,252,0.4)",
            boxShadow: "0 0 15px rgba(192,132,252,0.25)",
          }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full"
          style={{
            background: "rgba(244,114,182,0.35)",
            boxShadow: "0 0 18px rgba(244,114,182,0.2)",
          }}
        />
      </div>

      {/* ── Main Container ── */}
      <div
        className="relative w-full max-w-4xl mx-4 rounded-3xl overflow-hidden flex flex-col lg:flex-row"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(236,72,153,0.15)",
          boxShadow:
            "0 20px 60px rgba(236,72,153,0.1), 0 0 0 1px rgba(255,255,255,0.5)",
        }}
      >
        {/* ── Left Side - Image/Branding ── */}
        <div className="lg:w-1/2 p-12 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(192,132,252,0.1) 100%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* App Image */}
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
                }}
              />
              <img
                src={PinkleBall}
                alt="PicklePro"
                className="w-72 h-72 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter: "drop-shadow(0 20px 40px rgba(236,72,153,0.25))",
                }}
              />
            </div>

            

            
          </div>
        </div>

        {/* ── Right Side - Login Form ── */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500">
                Sign in to access your dashboard
              </p>
            </div>

            {/* ── Error ── */}
            {error && (
              <div
                className="mb-6 flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <AlertTriangle
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#ef4444" }}
                />
                <p className="text-xs leading-relaxed text-red-600">{error}</p>
              </div>
            )}

            {/* ── Debug info box ── */}
            {debugInfo && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-left"
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
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pinkleball.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-400/25 active:scale-[0.98]"
                style={{
                  background: loading
                    ? "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)"
                    : "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Authorized administrators only.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* ── Animation Keyframes ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(2deg); }
          66% { transform: translateY(10px) rotate(-2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(15px) rotate(-2deg); }
          66% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(1deg); }
        }
        
        @keyframes float-delayed-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 10s ease-in-out infinite reverse;
        }
        
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
        
        .animate-float-delayed-slow {
          animation: float 14s ease-in-out infinite reverse;
        }
      `}</style>
    </div>
  );
}
