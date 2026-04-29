import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Map as MapIcon,
  BarChart3,
  Bell,
  Settings,
  Calendar,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (c: boolean) => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getLinks = () => {
    const role = user?.role || "student";
    const links = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "student"] },
      { href: "/resources", label: "Resources", icon: BookOpen, roles: ["admin", "faculty"] },
      { href: "/bookings", label: "Bookings", icon: Calendar, roles: ["admin", "faculty", "student"] },
      { href: "/map", label: "Campus Map", icon: MapIcon, roles: ["admin", "faculty", "student"] },
      { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "faculty", "student"] },
      { href: "/admin", label: "Admin Panel", icon: Settings, roles: ["admin"] },
    ];
    return links.filter(link => link.roles.includes(role));
  };

  const links = getLinks();

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0 z-20 relative transition-all duration-300"
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors mx-auto flex items-center justify-center w-10 h-10"
        >
          <div className="font-bold text-xl text-primary">{collapsed ? "SC" : "Smart Campus"}</div>
        </button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto px-3 space-y-2">
        {links.map((link) => {
          const active = location === link.href || location.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
              active 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}>
              <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-primary")} />
              
              {!collapsed && (
                <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                  {link.label}
                </span>
              )}
              
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none shadow-md z-50 transition-opacity">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center px-3 py-3 w-full rounded-xl transition-all duration-200 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive group relative"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-destructive text-sidebar-foreground" />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
          
          {collapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none shadow-md z-50 transition-opacity">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
