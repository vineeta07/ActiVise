import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Shield,
  Trophy,
  Wallet,
  BarChart3,
  Code,
  MessageCircle,
  Menu,
  Bell,
  UserCircle2,
  Globe2,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";
import { useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { supportedLanguages } from "@/data/platformData";
import { getUnifiedNotifications } from "@/lib/campaignStore";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/campaigns", label: "Campaigns", icon: Layers },
  { path: "/report", label: "Report", icon: FileText },
  { path: "/volunteer", label: "Volunteer", icon: Sparkles },
  { path: "/proof", label: "Proof of Impact", icon: Shield },
  { path: "/certificates", label: "Certificates", icon: Award },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/donor", label: "Corporate Hub", icon: Wallet },
  { path: "/esg", label: "ESG Report", icon: BarChart3 },
  { path: "/api", label: "API Explorer", icon: Code },
  { path: "/community", label: "Community Hive", icon: MessageCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; time: string; channel?: "in-app" | "whatsapp" }>>([]);
  const [language, setLanguage] = useState("en");
  const location = useLocation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("activise-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const refreshNotifications = async () => {
      const list = await getUnifiedNotifications();
      setNotifications(list);
    };

    void refreshNotifications();
    const onStorage = () => {
      void refreshNotifications();
    };
    window.addEventListener("storage", onStorage);
    const poller = window.setInterval(() => {
      void refreshNotifications();
    }, 12000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poller);
    };
  }, [location.pathname]);

  const updateLanguage = (code: string) => {
    setLanguage(code);
    localStorage.setItem("activise-language", code);
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/90 border-r border-border backdrop-blur-xl transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <img
            src="/image.png"
            alt="ActiVise logo"
            className="h-9 w-9 rounded-xl object-cover border border-border shadow-sm"
          />
          <div>
            <span className="font-heading font-bold text-lg text-foreground block leading-tight">ActiVise</span>
            <span className="text-[11px] text-muted-foreground">AI Environmental Intelligence</span>
          </div>
        </div>
        <nav className="p-3 space-y-1.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/12 text-primary glow-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-3">
            <p className="text-xs font-heading text-primary">Priority Command</p>
            <p className="text-xs text-muted-foreground mt-1">3 verified urgent campaigns within 6km</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 lg:px-6">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 hidden md:flex items-center gap-3 max-w-md">
            <Globe2 className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="language" className="text-xs text-muted-foreground">Language</label>
            <select
              id="language"
              value={language}
              onChange={(event) => updateLanguage(event.target.value)}
              className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none"
            >
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-body hidden sm:inline">Live map synced</span>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="h-10 w-10 rounded-full border border-border bg-card/70 flex items-center justify-center hover:border-primary/60"
            >
              <Bell className="h-4 w-4" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[320px] rounded-xl border border-border bg-card shadow-xl p-2 z-40">
                <p className="px-2 py-1 text-xs font-heading text-muted-foreground">Notifications</p>
                <div className="space-y-1 max-h-72 overflow-auto">
                  {notifications.length === 0 && (
                    <div className="rounded-lg p-2 text-[11px] text-muted-foreground">
                      No notifications yet.
                    </div>
                  )}
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-lg p-2 hover:bg-secondary/70">
                      <p className="text-xs font-medium text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.message}</p>
                      <p className="text-[10px] text-primary mt-1">
                        {item.time} {item.channel ? `· ${item.channel}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          <button
            type="button"
            aria-label="User profile"
            className="h-10 w-10 rounded-full border border-border bg-card/70 flex items-center justify-center hover:border-primary/60"
          >
            <UserCircle2 className="h-5 w-5" />
          </button>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
