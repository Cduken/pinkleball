/* eslint-disable @typescript-eslint/no-unused-vars */
// AdminLayout.tsx
/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Trophy,
  LogOut,
  Menu,
  ChevronLeft,
  Images,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLogo from "../components/MainLogo/MainLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navLinks = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Reservations", icon: CalendarDays, href: "/admin/reservations" },
  { label: "Members", icon: Users, href: "/admin/participants" },
  { label: "Tournaments", icon: Trophy, href: "/admin/tournaments" },
  { label: "Gallery", icon: Images, href: "/admin/gallery" },
];

const P = {
  bg: "#0d0a0f",
  sidebar: "#110d16",
  border: "rgba(244,114,182,0.10)",
  borderHi: "rgba(244,114,182,0.22)",
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.45)",
  pinkGhost: "rgba(244,114,182,0.07)",
  pinkGlow: "rgba(244,114,182,0.18)",
  text: "rgba(255,255,255,0.85)",
  muted: "rgba(255,255,255,0.32)",
  faint: "rgba(255,255,255,0.10)",
};

export default function AdminLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

const handleSignOut = async () => {
  setShowSignOutDialog(false);
  
  try {
    await signOut();
    toast.success("Signed out successfully", {
      description: "You have been logged out of the admin panel.",
      duration: 3000,
    });
    navigate("/admin/login");
  } catch (error) {
    toast.error("Failed to sign out", {
      description: "Please try again.",
      duration: 3000,
    });
  }
};
  const handleNav = (href: string) => {
    navigate(href);
    setMobileOpen(false);
  };

  const SidebarInner = ({ mini }: { mini: boolean }) => (
    <div
      className="flex flex-col h-full"
      style={{
        background: `linear-gradient(180deg, ${P.sidebar} 0%, #0a0610 100%)`,
        borderRight: `1px solid ${P.border}`,
        width: mini ? 68 : 228,
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 shrink-0"
        style={{ borderBottom: `1px solid ${P.border}` }}
      >
        {!mini && (
          <div className="overflow-hidden">
            <MainLogo />
          </div>
        )}
        {!mini && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded-lg transition-colors shrink-0"
            style={{ color: P.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = P.pink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = P.muted)}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-hidden">
        {navLinks.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <button
              key={href}
              onClick={() => handleNav(href)}
              title={mini ? label : undefined}
              className="flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer w-full shrink-0"
              style={{
                padding: mini ? "10px 18px" : "10px 14px",
                justifyContent: mini ? "center" : "flex-start",
                background: active
                  ? "linear-gradient(135deg,rgba(190,24,93,0.18),rgba(236,72,153,0.10))"
                  : "transparent",
                border: active
                  ? `1px solid ${P.borderHi}`
                  : "1px solid transparent",
                color: active ? P.pink : P.muted,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = P.text;
                  e.currentTarget.style.background = P.pinkGhost;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = P.muted;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={17} className="shrink-0" />
              {!mini && (
                <span className="text-sm font-semibold whitespace-nowrap">
                  {label}
                </span>
              )}
              {!mini && active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: P.pink, boxShadow: `0 0 6px ${P.pink}` }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div
        className="px-2 pb-4 shrink-0"
        style={{ borderTop: `1px solid ${P.border}` }}
      >
        {!mini && (
          <div
            className="flex items-center gap-2.5 px-3 py-3 mt-3 mb-1 rounded-xl"
            style={{ background: P.pinkGhost }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{
                background: "linear-gradient(135deg,#be185d,#ec4899)",
                color: "#fff",
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.email}
              </p>
              <p className="text-[10px]" style={{ color: P.pinkDim }}>
                Administrator
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowSignOutDialog(true)}
          title={mini ? "Sign Out" : undefined}
          className="flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer w-full mt-1"
          style={{
            padding: mini ? "10px 18px" : "10px 14px",
            justifyContent: mini ? "center" : "flex-start",
            color: "rgba(251,113,133,0.5)",
            border: "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fb7185";
            e.currentTarget.style.background = "rgba(251,113,133,0.08)";
            e.currentTarget.style.border = "1px solid rgba(251,113,133,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(251,113,133,0.5)";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.border = "1px solid transparent";
          }}
        >
          <LogOut size={16} className="shrink-0" />
          {!mini && <span className="text-sm font-semibold">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: P.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Desktop sidebar */}
      <div
        className="hidden md:flex h-full shrink-0"
        style={{
          width: collapsed ? 68 : 228,
          transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <SidebarInner mini={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div style={{ width: 228 }}>
            <SidebarInner mini={false} />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center gap-4 px-6 py-4 shrink-0"
          style={{
            borderBottom: `1px solid ${P.border}`,
            background: "rgba(13,10,15,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3 p-[5.8px]">
            <button
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: P.pinkDim }}
              onMouseEnter={(e) => (e.currentTarget.style.color = P.pink)}
              onMouseLeave={(e) => (e.currentTarget.style.color = P.pinkDim)}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden md:flex p-2 rounded-xl transition-colors"
                style={{ color: P.pinkDim }}
                onMouseEnter={(e) => (e.currentTarget.style.color = P.pink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = P.pinkDim)}
              >
                <Menu size={18} />
              </button>
            )}
            <div>
              <h1
                className="font-black text-white text-lg"
                style={{ letterSpacing: "-0.04em" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-[11px] font-medium"
                  style={{ color: P.pinkDim }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </main>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
